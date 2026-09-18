import * as dotenv from 'dotenv';

// Stub 'server-only' for Node standalone execution
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (detail) console.error(`     Detail: ${detail}`);
    failCount++;
  }
}

async function runCms2ShellTestSuite() {
  console.log('========================================================================');
  console.log('🧪 CMS-2 ADMIN SHELL, LAYOUT & NAVIGATION SECURITY TEST SUITE');
  console.log('========================================================================\n');

  const { Role, Permission, hasPermission, resolvePermissionsForRoles } = await import(
    '../src/lib/auth/rbac'
  );
  const { ADMIN_NAV_GROUPS, getFilteredNavigation } = await import(
    '../src/components/admin/AdminNavConfig'
  );
  const { repositories } = await import('../src/repositories');
  const { resolveContent } = await import('../src/lib/routing/resolve-content');

  try {
    // -------------------------------------------------------------------------
    // TEST SUITE 1: Navigation Configuration & Module Permission Mapping
    // -------------------------------------------------------------------------
    console.log('📦 1. Navigation Configuration & Route Map Integrity:');

    const allItems = ADMIN_NAV_GROUPS.flatMap((g) => g.items);
    assert(allItems.length >= 11, 'Navigation config contains all registered admin modules', `Count: ${allItems.length}`);

    // Verify each item has required metadata
    for (const item of allItems) {
      assert(
        Boolean(item.id && item.label && item.href && item.icon && item.phaseTag),
        `Nav item '${item.id}' has complete metadata (id, label, href, icon, phaseTag)`
      );
      assert(
        item.href.startsWith('/admin'),
        `Nav item '${item.id}' lives under /admin namespace: ${item.href}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST SUITE 2: Role-Aware Navigation Filtering (UX Layer)
    // -------------------------------------------------------------------------
    console.log('\n📦 2. Role-Aware Navigation Filtering Tests (UX Layer):');

    // Super Admin: Sees all items (Dashboard + modules)
    const superAdminPerms = resolvePermissionsForRoles([Role.SUPER_ADMIN]);
    const superAdminNav = getFilteredNavigation([Role.SUPER_ADMIN], superAdminPerms);
    const superAdminItemCount = superAdminNav.flatMap((g) => g.items).length;
    assert(superAdminItemCount >= 11, 'SUPER_ADMIN navigation displays all admin modules');

    // Admin: Sees all except user.manage (9 items)
    const adminPerms = resolvePermissionsForRoles([Role.ADMIN]);
    const adminNav = getFilteredNavigation([Role.ADMIN], adminPerms);
    const adminItems = adminNav.flatMap((g) => g.items);
    assert(
      !adminItems.some((i) => i.id === 'users'),
      'ADMIN navigation hides System Users module'
    );
    assert(
      adminItems.some((i) => i.id === 'articles') && adminItems.some((i) => i.id === 'doctors'),
      'ADMIN navigation shows Articles and Doctors'
    );

    // Editor: Restricted set (Articles, Categories, Pages, Doctors, Packages, Media)
    const editorPerms = resolvePermissionsForRoles([Role.EDITOR]);
    const editorNav = getFilteredNavigation([Role.EDITOR], editorPerms);
    const editorItems = editorNav.flatMap((g) => g.items);
    assert(
      !editorItems.some((i) => i.id === 'users'),
      'EDITOR navigation hides System Users module'
    );
    assert(
      !editorItems.some((i) => i.id === 'audit'),
      'EDITOR navigation hides Audit Log module'
    );
    assert(
      !editorItems.some((i) => i.id === 'homepage'),
      'EDITOR navigation hides Homepage Config module'
    );
    assert(
      !editorItems.some((i) => i.id === 'clinic'),
      'EDITOR navigation hides Clinic Profile module'
    );
    assert(
      editorItems.some((i) => i.id === 'articles') && editorItems.some((i) => i.id === 'pages'),
      'EDITOR navigation shows permitted Articles and Pages modules'
    );

    // Doctor: Minimal set (Dashboard, Articles, Doctors, Media)
    const doctorPerms = resolvePermissionsForRoles([Role.DOCTOR]);
    const doctorNav = getFilteredNavigation([Role.DOCTOR], doctorPerms);
    const doctorItems = doctorNav.flatMap((g) => g.items);
    assert(
      !doctorItems.some((i) => i.id === 'packages'),
      'DOCTOR navigation hides Packages module'
    );
    assert(
      !doctorItems.some((i) => i.id === 'pages'),
      'DOCTOR navigation hides Pages module'
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 3: Server-Side Direct URL Authorization Guards (Authoritative)
    // -------------------------------------------------------------------------
    console.log('\n📦 3. Direct URL Authorization Server Guard Checks:');

    // Simulate an Editor attempting to access various URLs
    const editorRoles = [Role.EDITOR];

    // Allowed for Editor
    assert(
      hasPermission(editorRoles, editorPerms, Permission.ARTICLE_READ) === true,
      'Direct GET /admin/articles: ALLOWED for EDITOR'
    );
    assert(
      hasPermission(editorRoles, editorPerms, Permission.PAGE_READ) === true,
      'Direct GET /admin/pages: ALLOWED for EDITOR'
    );
    assert(
      hasPermission(editorRoles, editorPerms, Permission.CATEGORY_MANAGE) === true,
      'Direct GET /admin/categories: ALLOWED for EDITOR'
    );

    // Denied for Editor (Server Guard would return isAuthorized = false)
    assert(
      hasPermission(editorRoles, editorPerms, Permission.USER_MANAGE) === false,
      'Direct GET /admin/users: BLOCKED for EDITOR (403 Forbidden)'
    );
    assert(
      hasPermission(editorRoles, editorPerms, Permission.AUDIT_READ) === false,
      'Direct GET /admin/audit: BLOCKED for EDITOR (403 Forbidden)'
    );
    assert(
      hasPermission(editorRoles, editorPerms, Permission.HOMEPAGE_EDIT) === false,
      'Direct GET /admin/homepage: BLOCKED for EDITOR (403 Forbidden)'
    );
    assert(
      hasPermission(editorRoles, editorPerms, Permission.CLINIC_EDIT) === false,
      'Direct GET /admin/clinic: BLOCKED for EDITOR (403 Forbidden)'
    );

    // Superadmin passes all direct guards
    const superAdminRoles = [Role.SUPER_ADMIN];
    assert(
      hasPermission(superAdminRoles, superAdminPerms, Permission.USER_MANAGE) === true,
      'Direct GET /admin/users: ALLOWED for SUPER_ADMIN'
    );
    assert(
      hasPermission(superAdminRoles, superAdminPerms, Permission.AUDIT_READ) === true,
      'Direct GET /admin/audit: ALLOWED for SUPER_ADMIN'
    );
    assert(
      hasPermission(superAdminRoles, superAdminPerms, Permission.HOMEPAGE_EDIT) === true,
      'Direct GET /admin/homepage: ALLOWED for SUPER_ADMIN'
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 4: Public Site & Collision Routing Non-Interference
    // -------------------------------------------------------------------------
    console.log('\n📦 4. Public Site Non-Interference & Collision Routing Regression:');

    const docCount = (await repositories.doctor.getAll()).length;
    const pkgCount = (await repositories.package.getAll()).length;
    const catCount = (await repositories.category.getAll()).length;
    const artCount = (await repositories.article.getAll()).length;
    const pageCount = (await repositories.page.getAll()).length;
    const clinic = await repositories.clinic.getClinicInfo();
    const homepage = await repositories.homepage.getHomepageData();

    assert(docCount === 7, `Doctors repository intact: ${docCount} doctors`);
    assert(pkgCount === 9, `Packages repository intact: ${pkgCount} packages`);
    assert(catCount === 30, `Categories repository intact: ${catCount} categories`);
    assert(artCount === 108, `Articles repository intact: ${artCount} articles`);
    assert(pageCount === 55, `Pages repository intact: ${pageCount} pages`);
    assert(Boolean(clinic?.hotline), `Clinic repository intact: Hotline ${clinic?.hotline}`);
    assert(Boolean(homepage?.hero?.title), `Homepage repository intact: Hero "${homepage?.hero?.title}"`);

    // Verify 6 collision invariants
    const postCollisions = ['dau-thuong-vi', 'tieu-chay', 'di-ngoai-ra-mau', 'tao-bon'];
    for (const slug of postCollisions) {
      const resolved = resolveContent(slug);
      assert(
        resolved.type === 'article',
        `Collision slug '${slug}' strictly resolves to article`
      );
    }

    const categoryCollisions = ['kien-thuc-ung-thu-da-day', 'kien-thuc-ung-thu-dai-trang'];
    for (const slug of categoryCollisions) {
      const resolved = resolveContent(slug);
      assert(
        resolved.type === 'category',
        `Collision slug '${slug}' strictly resolves to category at root`
      );
    }

    // Verify 'admin' does not resolve to public content
    const adminResolved = resolveContent('admin');
    assert(
      adminResolved.type === 'notFound',
      "Public dynamic resolver rejects 'admin' (type: notFound)"
    );

    console.log('\n========================================================================');
    console.log(`🎉 CMS-2 TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('========================================================================');

    if (failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ CMS-2 test suite fatal error:', error);
    process.exit(1);
  }
}

runCms2ShellTestSuite();
