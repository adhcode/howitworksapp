import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';

@Module({
  controllers: [PropertiesController, UnitsController],
  providers: [PropertiesService, UnitsService],
  exports: [PropertiesService, UnitsService],
})
export class PropertiesModule {}