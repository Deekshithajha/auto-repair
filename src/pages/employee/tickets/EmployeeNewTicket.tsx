import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TopAppBar } from '../../../components/navigation/TopAppBar';
import { PhotoUpload } from '../../../components/ui/PhotoUpload';
import { customers } from '../../../data/customers';
import { vehicles } from '../../../data/vehicles';
import { services } from '../../../data/services';
import { Customer, Vehicle, Service, PhotoCategory, Photo } from '../../../types';
import { ticketService } from '../../../services/ticketService';

type Step = 'customer-lookup' | 'vehicle-selection' | 'issue-description' | 'service-selection' | 'review';

interface TicketPhoto {
  id: string;
  file?: File;
  url: string;
  category: PhotoCategory;
  description?: string;
}

export const EmployeeNewTicket: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('customer-lookup');
  
  // Customer Lookup State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phone2: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    preferredNotification: 'text' as 'text' | 'call' | 'email',
  });

  // Vehicle State
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    vin: '',
  });
  const [vehiclePhotos, setVehiclePhotos] = useState<TicketPhoto[]>([]);

  // Issue Description State
  const [symptoms, setSymptoms] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [issuePhotos, setIssuePhotos] = useState<TicketPhoto[]>([]);

  // Service Selection State
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  // Search customers
  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.firstName.toLowerCase().includes(query) ||
      customer.lastName.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      vehicles.some((v) => v.customerId === customer.id && v.plate.toLowerCase().includes(query))
    );
  });

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentStep('vehicle-selection');
  };

  const handleCreateCustomer = () => {
    // In a real app, this would call an API
    const customerId = `c${Date.now()}`;
    const customer: Customer = {
      id: customerId,
      ...newCustomer,
      vehicles: [],
      tickets: [],
      invoices: [],
      createdAt: new Date().toISOString(),
    };
    setSelectedCustomer(customer);
    setIsCreatingCustomer(false);
    setCurrentStep('vehicle-selection');
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentStep('issue-description');
  };

  const handleCreateVehicle = () => {
    // In a real app, this would call an API
    const vehicleId = `v${Date.now()}`;
    const vehicle: Vehicle = {
      id: vehicleId,
      customerId: selectedCustomer!.id,
      ...newVehicle,
      photos: vehiclePhotos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        category: photo.category,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'e1', // Current employee ID
        description: photo.description,
      })),
    };
    setSelectedVehicle(vehicle);
    setIsCreatingVehicle(false);
    setCurrentStep('issue-description');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitTicket = async () => {
    if (!selectedCustomer || !selectedVehicle) {
      setSubmitError('Customer and vehicle must be selected');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Convert TicketPhoto[] to Photo[]
      const photos: Photo[] = issuePhotos.map((tp) => ({
        id: tp.id,
        category: tp.category,
        dataUrl: tp.url,
        description: tp.description,
        createdAt: new Date().toISOString(),
      }));

      // Convert vehicle photos if any
      const vehiclePhotoArray: Photo[] = vehiclePhotos.map((vp) => ({
        id: vp.id,
        category: vp.category,
        dataUrl: vp.url,
        description: vp.description,
        createdAt: new Date().toISOString(),
      }));

      // Combine all photos
      const allPhotos = [...photos, ...vehiclePhotoArray];

      // Create ticket via TicketService
      const ticket = await ticketService.createTicketFromEmployeeFlow({
        customer: selectedCustomer,
        vehicle: selectedVehicle,
        symptoms,
        description: additionalNotes,
        selectedServices: selectedServices.length > 0 ? selectedServices : undefined,
        photos: allPhotos.length > 0 ? allPhotos : undefined,
        schedulingPreferences: {
          notificationMethod: selectedCustomer.preferredNotification,
        },
      });

      // Navigate back to employee dashboard
      navigate('/employee');
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setSubmitError('Failed to create ticket. Please try again.');
      setIsSubmitting(false);
    }
  };

  const customerVehicles = selectedCustomer
    ? vehicles.filter((v) => v.customerId === selectedCustomer.id)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-soft via-white to-bg-soft pb-24 md:pb-6">
      <TopAppBar
        title="Create New Ticket"
        leftIcon={
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        }
        onLeftClick={() => {
          if (currentStep === 'customer-lookup') {
            navigate('/employee');
          } else if (currentStep === 'vehicle-selection') {
            setCurrentStep('customer-lookup');
          } else if (currentStep === 'issue-description') {
            setCurrentStep('vehicle-selection');
          } else if (currentStep === 'service-selection') {
            setCurrentStep('issue-description');
          } else if (currentStep === 'review') {
            setCurrentStep('service-selection');
          }
        }}
      />

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {['Customer', 'Vehicle', 'Issue', 'Services', 'Review'].map((label, index) => {
              const stepIndex = ['customer-lookup', 'vehicle-selection', 'issue-description', 'service-selection', 'review'].indexOf(currentStep);
              const isActive = index === stepIndex;
              const isCompleted = index < stepIndex;

              return (
                <div key={label} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  {index < 4 && (
                    <div
                      className={`w-8 md:w-16 h-1 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-text-muted">
            {['Customer', 'Vehicle', 'Issue', 'Services', 'Review'].map((label) => (
              <span key={label} className="w-16 text-center">
                {label}
              </span>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Customer Lookup */}
          {currentStep === 'customer-lookup' && (
            <motion.div
              key="customer-lookup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-text-main mb-4">Find or Create Customer</h2>

                {!isCreatingCustomer ? (
                  <>
                    {/* Search Bar */}
                    <div className="relative mb-4">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, phone, or license plate..."
                        className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                      />
                      <svg
                        className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {/* Customer Results */}
                    {searchQuery && (
                      <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map((customer) => (
                            <motion.div
                              key={customer.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleCustomerSelect(customer)}
                              className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-primary cursor-pointer transition-all"
                            >
                              <p className="font-semibold text-text-main">
                                {customer.firstName} {customer.lastName}
                              </p>
                              <p className="text-sm text-text-muted">{customer.email}</p>
                              <p className="text-sm text-text-muted">{customer.phone}</p>
                              {customer.vehicles.length > 0 && (
                                <p className="text-xs text-primary mt-1">
                                  {customer.vehicles.length} vehicle(s) on file
                                </p>
                              )}
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-center text-text-muted py-4">No customers found</p>
                        )}
                      </div>
                    )}

                    {/* Create New Customer Button */}
                    <button
                      type="button"
                      onClick={() => setIsCreatingCustomer(true)}
                      className="w-full py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/10 transition-colors"
                    >
                      + Create New Customer
                    </button>
                  </>
                ) : (
                  <>
                    {/* New Customer Form */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-text-main mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={newCustomer.firstName}
                            onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-text-main mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={newCustomer.lastName}
                            onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">Email *</label>
                        <input
                          type="email"
                          value={newCustomer.email}
                          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-text-main mb-2">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-text-main mb-2">
                            Phone 2 (Optional)
                          </label>
                          <input
                            type="tel"
                            value={newCustomer.phone2}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone2: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">Address</label>
                        <input
                          type="text"
                          value={newCustomer.address}
                          onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-semibold text-text-main mb-2">City</label>
                          <input
                            type="text"
                            value={newCustomer.city}
                            onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-text-main mb-2">State</label>
                          <input
                            type="text"
                            value={newCustomer.state}
                            onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                            maxLength={2}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">
                          Preferred Notification Method
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {['text', 'call', 'email'].map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() =>
                                setNewCustomer({
                                  ...newCustomer,
                                  preferredNotification: method as 'text' | 'call' | 'email',
                                })
                              }
                              className={`py-3 rounded-xl border-2 font-semibold capitalize transition-all ${
                                newCustomer.preferredNotification === method
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-gray-200 text-text-muted hover:border-primary/50'
                              }`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setIsCreatingCustomer(false)}
                          className="flex-1 py-3 border-2 border-gray-300 text-text-main rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateCustomer}
                          disabled={
                            !newCustomer.firstName ||
                            !newCustomer.lastName ||
                            !newCustomer.email ||
                            !newCustomer.phone
                          }
                          className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Create Customer
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Vehicle Selection */}
          {currentStep === 'vehicle-selection' && selectedCustomer && (
            <motion.div
              key="vehicle-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-text-main mb-2">Select Vehicle</h2>
                <p className="text-sm text-text-muted mb-4">
                  Customer: {selectedCustomer.firstName} {selectedCustomer.lastName}
                </p>

                {!isCreatingVehicle ? (
                  <>
                    {/* Existing Vehicles */}
                    {customerVehicles.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {customerVehicles.map((vehicle) => (
                          <motion.div
                            key={vehicle.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleVehicleSelect(vehicle)}
                            className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-primary cursor-pointer transition-all"
                          >
                            <p className="font-semibold text-text-main">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-sm text-text-muted">{vehicle.plate}</p>
                            {vehicle.nickname && (
                              <p className="text-xs text-primary mt-1">"{vehicle.nickname}"</p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Add New Vehicle Button */}
                    <button
                      type="button"
                      onClick={() => setIsCreatingVehicle(true)}
                      className="w-full py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/10 transition-colors"
                    >
                      + Add New Vehicle
                    </button>
                  </>
                ) : (
                  <>
                    {/* New Vehicle Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">
                          License Plate *
                        </label>
                        <input
                          type="text"
                          value={newVehicle.plate}
                          onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none uppercase"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-text-main mb-2">Make *</label>
                          <input
                            type="text"
                            value={newVehicle.make}
                            onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-text-main mb-2">Model *</label>
                          <input
                            type="text"
                            value={newVehicle.model}
                            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-text-main mb-2">Year *</label>
                          <input
                            type="number"
                            value={newVehicle.year}
                            onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                            min={1900}
                            max={new Date().getFullYear() + 1}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-text-main mb-2">Color</label>
                          <input
                            type="text"
                            value={newVehicle.color}
                            onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">VIN (Optional)</label>
                        <input
                          type="text"
                          value={newVehicle.vin}
                          onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value.toUpperCase() })}
                          maxLength={17}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">
                          Vehicle Photos (Optional)
                        </label>
                        <PhotoUpload photos={vehiclePhotos} onPhotosChange={setVehiclePhotos} maxPhotos={10} />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setIsCreatingVehicle(false)}
                          className="flex-1 py-3 border-2 border-gray-300 text-text-main rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateVehicle}
                          disabled={
                            !newVehicle.plate || !newVehicle.make || !newVehicle.model || !newVehicle.year
                          }
                          className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Vehicle
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Issue Description */}
          {currentStep === 'issue-description' && selectedVehicle && (
            <motion.div
              key="issue-description"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-text-main mb-2">Document Customer's Issue</h2>
                <p className="text-sm text-text-muted mb-4">
                  Vehicle: {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.plate})
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Customer's Symptoms / Concerns *
                    </label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Describe exactly what the customer reported (e.g., 'Makes grinding noise when braking', 'AC not cooling', etc.)"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none resize-none"
                      rows={5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Additional Notes / Observations
                    </label>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Add any additional observations, environmental factors, or customer comments..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Issue Photos (Optional)
                    </label>
                    <PhotoUpload photos={issuePhotos} onPhotosChange={setIssuePhotos} maxPhotos={10} />
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep('service-selection')}
                    disabled={!symptoms.trim()}
                    className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Services
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Service Selection */}
          {currentStep === 'service-selection' && (
            <motion.div
              key="service-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-text-main mb-2">Select Services (Optional)</h2>
                <p className="text-sm text-text-muted mb-4">
                  You can select services now or let the mechanic diagnose and recommend later.
                </p>

                <div className="space-y-3 mb-4">
                  {services.map((service) => {
                    const isSelected = selectedServices.some((s) => s.id === service.id);
                    return (
                      <motion.div
                        key={service.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
                          } else {
                            setSelectedServices([...selectedServices, service]);
                          }
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-text-main">{service.name}</p>
                            {service.description && (
                              <p className="text-sm text-text-muted mt-1">{service.description}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep('review')}
                  className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                >
                  Continue to Review
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Review */}
          {currentStep === 'review' && selectedCustomer && selectedVehicle && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-text-main mb-4">Review & Submit Ticket</h2>
                
                {submitError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}

                {/* Customer Info */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-text-muted mb-2">Customer</h3>
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                    <p className="font-semibold text-text-main">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </p>
                    <p className="text-sm text-text-muted">{selectedCustomer.email}</p>
                    <p className="text-sm text-text-muted">{selectedCustomer.phone}</p>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-text-muted mb-2">Vehicle</h3>
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                    <p className="font-semibold text-text-main">
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                    </p>
                    <p className="text-sm text-text-muted">{selectedVehicle.plate}</p>
                  </div>
                </div>

                {/* Issue Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-text-muted mb-2">Issue Description</h3>
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                    <p className="text-sm text-text-main whitespace-pre-wrap">{symptoms}</p>
                    {additionalNotes && (
                      <p className="text-sm text-text-muted mt-2 whitespace-pre-wrap">{additionalNotes}</p>
                    )}
                  </div>
                </div>

                {/* Selected Services */}
                {selectedServices.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-text-muted mb-2">Selected Services</h3>
                    <div className="space-y-2">
                      {selectedServices.map((service) => (
                        <div
                          key={service.id}
                          className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200"
                        >
                          <p className="text-sm font-semibold text-text-main">{service.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {issuePhotos.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-text-muted mb-2">Photos Attached</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {issuePhotos.map((photo) => (
                        <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img src={photo.url} alt="Issue" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmitTicket}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      <span>Creating Ticket...</span>
                    </>
                  ) : (
                    'Submit Ticket'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

