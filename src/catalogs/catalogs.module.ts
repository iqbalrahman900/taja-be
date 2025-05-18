// src/catalogs/catalogs.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';
import { Catalog, CatalogSchema } from './schemas/catalog.schema';
import { Contributor, ContributorSchema } from './schemas/contributor.schema';
import { Distribution, DistributionSchema } from './schemas/distribution.schema';
import { Income, IncomeSchema } from './schemas/income.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Catalog.name, schema: CatalogSchema },
      { name: Contributor.name, schema: ContributorSchema },
      { name: Distribution.name, schema: DistributionSchema },
      { name: Income.name, schema: IncomeSchema },
    ]),
  ],
  controllers: [CatalogsController],
  providers: [CatalogsService],
  exports: [CatalogsService],
})
export class CatalogsModule {}