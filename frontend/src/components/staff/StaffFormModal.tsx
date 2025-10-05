import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Staff, Clinic } from '../../types/models';

interface StaffFormModalProps {
  staff?: Staff | null;
  clinics: Clinic[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staffData: Partial<Staff>) => Promise<void>;
  isLoading: boolean;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  staff,
  clinics,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'doctor' as 'doctor' | 'dental_assistant' | 'admin',
    primary_clinic_id: '',
    weekly_off_day: 0,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        role: staff.role || 'doctor',
        primary_clinic_id: staff.primary_clinic_id || '',
        weekly_off_day: staff.weekly_off_day ?? 0,
        is_active: staff.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'doctor',
        primary_clinic_id: clinics[0]?.id || '',
        weekly_off_day: 0,
        is_active: true,
      });
    }
    setErrors({});
  }, [staff, clinics, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.primary_clinic_id && formData.role !== 'admin') {
      newErrors.primary_clinic_id = 'Primary clinic is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!isOpen) return null;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {staff ? 'Edit Staff Member' : 'Add Staff Member'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Dr. John Doe"
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="john.doe@clinic.com"
              disabled={isLoading || !!staff}
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            {staff && <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => {
                const newRole = e.target.value as 'doctor' | 'dental_assistant' | 'admin';
                setFormData({
                  ...formData,
                  role: newRole,
                  primary_clinic_id: newRole === 'admin' ? '' : formData.primary_clinic_id,
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={isLoading}
            >
              <option value="doctor">Doctor</option>
              <option value="dental_assistant">Dental Assistant</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Primary Clinic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Clinic {formData.role !== 'admin' ? '*' : ''}
            </label>
            <select
              value={formData.primary_clinic_id}
              onChange={(e) => setFormData({ ...formData, primary_clinic_id: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.primary_clinic_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading || formData.role === 'admin'}
            >
              <option value="">{formData.role === 'admin' ? 'Not applicable for admin' : 'Select a clinic'}</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
            {errors.primary_clinic_id && (
              <p className="text-sm text-red-600 mt-1">{errors.primary_clinic_id}</p>
            )}
          </div>

          {/* Weekly Off Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Off Day</label>
            <select
              value={formData.weekly_off_day}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  weekly_off_day: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={isLoading}
            >
              {dayNames.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
              Active
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : staff ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
