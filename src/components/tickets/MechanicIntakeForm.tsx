import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MechanicIntake } from '../../types';

interface MechanicIntakeFormProps {
  ticketId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  onComplete: (intake: MechanicIntake) => void;
  onCancel?: () => void;
  initialData?: Partial<MechanicIntake>;
}

export const MechanicIntakeForm: React.FC<MechanicIntakeFormProps> = ({
  ticketId,
  vehicleMake,
  vehicleModel,
  vehicleYear,
  onComplete,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<MechanicIntake>>({
    mileage: initialData?.mileage || 0,
    vin: initialData?.vin || '',
    engineType: initialData?.engineType || '',
    transmissionType: initialData?.transmissionType || 'automatic',
    drivetrain: initialData?.drivetrain || 'fwd',
    fuelType: initialData?.fuelType || 'gasoline',
    checkEngineLightOn: initialData?.checkEngineLightOn || false,
    tireConditionNotes: initialData?.tireConditionNotes || '',
    brakeConditionNotes: initialData?.brakeConditionNotes || '',
    fluidCheckNotes: initialData?.fluidCheckNotes || '',
    batteryHealthNotes: initialData?.batteryHealthNotes || '',
    exteriorDamageNotes: initialData?.exteriorDamageNotes || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.mileage || formData.mileage <= 0) {
      newErrors.mileage = 'Mileage is required';
    }

    if (!formData.vin || formData.vin.trim().length === 0) {
      newErrors.vin = 'VIN is required';
    } else if (formData.vin.length < 17) {
      newErrors.vin = 'VIN must be 17 characters';
    }

    if (!formData.engineType || formData.engineType.trim().length === 0) {
      newErrors.engineType = 'Engine type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const intake: MechanicIntake = {
      mileage: formData.mileage!,
      vin: formData.vin!.toUpperCase(),
      engineType: formData.engineType!,
      transmissionType: formData.transmissionType!,
      drivetrain: formData.drivetrain!,
      fuelType: formData.fuelType!,
      checkEngineLightOn: formData.checkEngineLightOn!,
      tireConditionNotes: formData.tireConditionNotes || undefined,
      brakeConditionNotes: formData.brakeConditionNotes || undefined,
      fluidCheckNotes: formData.fluidCheckNotes || undefined,
      batteryHealthNotes: formData.batteryHealthNotes || undefined,
      exteriorDamageNotes: formData.exteriorDamageNotes || undefined,
      intakeCompletedAt: new Date().toISOString(),
      intakeMechanicId: 'e1', // In real app, get from auth context
    };

    onComplete(intake);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-main mb-2">Pre-Service Intake</h2>
        <p className="text-sm text-text-muted">
          Complete vehicle inspection before starting work
        </p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Vehicle:</strong> {vehicleYear} {vehicleMake} {vehicleModel}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-main border-b border-gray-200 pb-2">
            Required Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Current Mileage *"
                type="number"
                value={formData.mileage?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                required
                error={errors.mileage}
                placeholder="e.g., 45000"
              />
            </div>

            <div>
              <Input
                label="VIN (Vehicle Identification Number) *"
                type="text"
                value={formData.vin || ''}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                required
                error={errors.vin}
                placeholder="17 characters"
                maxLength={17}
              />
            </div>
          </div>

          <div>
            <Input
              label="Engine Type *"
              type="text"
              value={formData.engineType || ''}
              onChange={(e) => setFormData({ ...formData, engineType: e.target.value })}
              required
              error={errors.engineType}
              placeholder="e.g., 2.0L Turbo I4, 3.5L V6"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">
                Transmission Type *
              </label>
              <select
                value={formData.transmissionType}
                onChange={(e) => setFormData({ ...formData, transmissionType: e.target.value as any })}
                className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="cvt">CVT</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">
                Drivetrain *
              </label>
              <select
                value={formData.drivetrain}
                onChange={(e) => setFormData({ ...formData, drivetrain: e.target.value as any })}
                className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="fwd">FWD (Front Wheel Drive)</option>
                <option value="rwd">RWD (Rear Wheel Drive)</option>
                <option value="awd">AWD (All Wheel Drive)</option>
                <option value="4x4">4x4</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Fuel Type *
            </label>
            <select
              value={formData.fuelType}
              onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
              className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="ev">Electric (EV)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="checkEngineLight"
              checked={formData.checkEngineLightOn}
              onChange={(e) => setFormData({ ...formData, checkEngineLightOn: e.target.checked })}
              className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="checkEngineLight" className="text-sm font-medium text-text-main cursor-pointer">
              Check Engine Light is ON
            </label>
          </div>
        </div>

        {/* Condition Checks */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-main border-b border-gray-200 pb-2">
            Condition & Safety Checks (Optional)
          </h3>

          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Tire Condition Notes
            </label>
            <textarea
              value={formData.tireConditionNotes || ''}
              onChange={(e) => setFormData({ ...formData, tireConditionNotes: e.target.value })}
              placeholder="Note tire wear, pressure, damage, etc."
              className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Brake Condition Notes
            </label>
            <textarea
              value={formData.brakeConditionNotes || ''}
              onChange={(e) => setFormData({ ...formData, brakeConditionNotes: e.target.value })}
              placeholder="Note brake pad wear, rotor condition, fluid level, etc."
              className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Fluid Check Notes
            </label>
            <textarea
              value={formData.fluidCheckNotes || ''}
              onChange={(e) => setFormData({ ...formData, fluidCheckNotes: e.target.value })}
              placeholder="Note engine oil, coolant, transmission fluid, brake fluid levels and condition"
              className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Battery Health Notes
            </label>
            <textarea
              value={formData.batteryHealthNotes || ''}
              onChange={(e) => setFormData({ ...formData, batteryHealthNotes: e.target.value })}
              placeholder="Note battery age, voltage, terminal condition, etc."
              className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Exterior Damage Notes
            </label>
            <textarea
              value={formData.exteriorDamageNotes || ''}
              onChange={(e) => setFormData({ ...formData, exteriorDamageNotes: e.target.value })}
              placeholder="Note any dents, scratches, paint damage, etc."
              className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
          >
            Complete Intake
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

