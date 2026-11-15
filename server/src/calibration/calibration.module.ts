import { Module } from '@nestjs/common';
import { CalibrationService } from './calibration.service.js';
@Module({ providers: [CalibrationService], exports: [CalibrationService] }) export class CalibrationModule {}
