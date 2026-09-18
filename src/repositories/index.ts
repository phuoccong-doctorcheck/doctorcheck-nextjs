import { IArticleRepository } from './contracts/article.repository';
import { IDoctorRepository } from './contracts/doctor.repository';
import { IPackageRepository } from './contracts/package.repository';
import { ICategoryRepository } from './contracts/category.repository';
import { IPageRepository } from './contracts/page.repository';
import { IClinicRepository } from './contracts/clinic.repository';
import { IClinicalTrustRepository } from './contracts/clinical-trust.repository';
import { IHomepageRepository } from './contracts/homepage.repository';
import { IMediaRepository } from './contracts/media.repository';

import { StaticArticleRepository } from './static/static-article.repository';
import { StaticDoctorRepository } from './static/static-doctor.repository';
import { StaticPackageRepository } from './static/static-package.repository';
import { StaticCategoryRepository } from './static/static-category.repository';
import { StaticPageRepository } from './static/static-page.repository';
import { StaticClinicRepository } from './static/static-clinic.repository';
import { StaticClinicalTrustRepository } from './static/static-clinical-trust.repository';
import { StaticHomepageRepository } from './static/static-homepage.repository';

import { PostgresArticleRepository } from './postgres/postgres-article.repository';
import { PostgresDoctorRepository } from './postgres/postgres-doctor.repository';
import { PostgresPackageRepository } from './postgres/postgres-package.repository';
import { PostgresCategoryRepository } from './postgres/postgres-category.repository';
import { PostgresPageRepository } from './postgres/postgres-page.repository';
import { PostgresClinicRepository } from './postgres/postgres-clinic.repository';
import { PostgresClinicalTrustRepository } from './postgres/postgres-clinical-trust.repository';
import { PostgresHomepageRepository } from './postgres/postgres-homepage.repository';
import { PostgresMediaRepository } from './postgres/postgres-media.repository';

export interface RepositoryContainer {
  article: IArticleRepository;
  doctor: IDoctorRepository;
  package: IPackageRepository;
  category: ICategoryRepository;
  page: IPageRepository;
  clinic: IClinicRepository;
  clinicalTrust: IClinicalTrustRepository;
  homepage: IHomepageRepository;
  media: IMediaRepository;
}

export type DataProviderType = 'static' | 'postgres';

// Singletons for static repositories
const staticContainer: Omit<RepositoryContainer, 'media'> = {
  article: new StaticArticleRepository(),
  doctor: new StaticDoctorRepository(),
  package: new StaticPackageRepository(),
  category: new StaticCategoryRepository(),
  page: new StaticPageRepository(),
  clinic: new StaticClinicRepository(),
  clinicalTrust: new StaticClinicalTrustRepository(),
  homepage: new StaticHomepageRepository(),
};

// Lazy singletons for postgres repositories
let postgresContainer: RepositoryContainer | null = null;

function getPostgresContainer(): RepositoryContainer {
  if (!postgresContainer) {
    postgresContainer = {
      article: new PostgresArticleRepository(),
      doctor: new PostgresDoctorRepository(),
      package: new PostgresPackageRepository(),
      category: new PostgresCategoryRepository(),
      page: new PostgresPageRepository(),
      clinic: new PostgresClinicRepository(),
      clinicalTrust: new PostgresClinicalTrustRepository(),
      homepage: new PostgresHomepageRepository(),
      media: new PostgresMediaRepository(),
    };
  }
  return postgresContainer;
}

export interface DomainProviderConfig {
  article: DataProviderType;
  doctor: DataProviderType;
  package: DataProviderType;
  category: DataProviderType;
  page: DataProviderType;
  clinic: DataProviderType;
  clinicalTrust: DataProviderType;
  homepage: DataProviderType;
}

/**
 * DOMAIN-BY-DOMAIN DATA PROVIDER CONFIGURATION
 *
 * DB-6 through DB-12 Cutover Targets (All on PostgreSQL)
 */
const defaultDomainConfig: DomainProviderConfig = {
  article: (process.env.ARTICLE_DATA_PROVIDER as DataProviderType) || 'postgres',
  doctor: (process.env.DOCTOR_DATA_PROVIDER as DataProviderType) || 'postgres',
  package: (process.env.PACKAGE_DATA_PROVIDER as DataProviderType) || 'postgres',
  category: (process.env.CATEGORY_DATA_PROVIDER as DataProviderType) || 'postgres',
  page: (process.env.PAGE_DATA_PROVIDER as DataProviderType) || 'postgres',
  clinic: (process.env.CLINIC_DATA_PROVIDER as DataProviderType) || 'postgres',
  clinicalTrust: (process.env.CLINICAL_TRUST_DATA_PROVIDER as DataProviderType) || 'postgres',
  homepage: (process.env.HOMEPAGE_DATA_PROVIDER as DataProviderType) || 'postgres',
};

/**
 * Returns a repository container based on domain configuration.
 */
export function getRepositories(configOverrides?: DataProviderType | Partial<DomainProviderConfig>): RepositoryContainer {
  if (typeof configOverrides === 'string') {
    if (configOverrides === 'postgres') return getPostgresContainer();
    if (configOverrides === 'static') {
      return {
        ...staticContainer,
        media: getPostgresContainer().media,
      };
    }
  }

  const domainConfig: DomainProviderConfig = {
    ...defaultDomainConfig,
    ...(typeof configOverrides === 'object' ? configOverrides : {}),
  };

  return {
    article: domainConfig.article === 'postgres' ? getPostgresContainer().article : staticContainer.article,
    doctor: domainConfig.doctor === 'postgres' ? getPostgresContainer().doctor : staticContainer.doctor,
    package: domainConfig.package === 'postgres' ? getPostgresContainer().package : staticContainer.package,
    category: domainConfig.category === 'postgres' ? getPostgresContainer().category : staticContainer.category,
    page: domainConfig.page === 'postgres' ? getPostgresContainer().page : staticContainer.page,
    clinic: domainConfig.clinic === 'postgres' ? getPostgresContainer().clinic : staticContainer.clinic,
    clinicalTrust: domainConfig.clinicalTrust === 'postgres' ? getPostgresContainer().clinicalTrust : staticContainer.clinicalTrust,
    homepage: domainConfig.homepage === 'postgres' ? getPostgresContainer().homepage : staticContainer.homepage,
    media: getPostgresContainer().media,
  };
}

/**
 * DEFAULT APPLICATION REPOSITORY INSTANCE
 */
export const repositories = getRepositories();

// Direct named exports for convenient consumption
export const articleRepository = repositories.article;
export const doctorRepository = repositories.doctor;
export const packageRepository = repositories.package;
export const categoryRepository = repositories.category;
export const pageRepository = repositories.page;
export const clinicRepository = repositories.clinic;
export const clinicalTrustRepository = repositories.clinicalTrust;
export const homepageRepository = repositories.homepage;
export const mediaRepository = repositories.media;

// Export all contracts
export * from './contracts/article.repository';
export * from './contracts/doctor.repository';
export * from './contracts/package.repository';
export * from './contracts/category.repository';
export * from './contracts/page.repository';
export * from './contracts/clinic.repository';
export * from './contracts/clinical-trust.repository';
export * from './contracts/homepage.repository';
export * from './contracts/media.repository';
export * from './contracts/redirect.repository';
export * from './contracts/user.repository';
export * from './contracts/audit.repository';
export { redirectRepository } from './postgres/postgres-redirect.repository';
export { userRepository } from './postgres/postgres-user.repository';
export { auditRepository } from './postgres/postgres-audit.repository';
