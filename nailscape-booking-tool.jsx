import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, AlertCircle, Check, X, Menu, LogOut } from 'lucide-react';

const NailscapeBookingTool = () => {
  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState('booking'); // 'booking', 'admin'
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bookingDate: '',
    serviceMain: '',
    nailsForRepair: 1,
    addOns: [],
    message: ''
  });

  // Admin state
  const [blockedDates, setBlockedDates] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);

  // Bookings
  const [allBookings, setAllBookings] = useState([]);
  const [submittedMessage, setSubmittedMessage] = useState('');

  // ===== SERVICE DATA =====
  const mainServices = [
    { id: 'gel-nails', name: 'Full Cover Gel Nails (incl. Manicure & Color)', price: 45, duration: 120, description: 'Base service / Grundleistung' },
    { id: 'nail-repair', name: 'Nail Repair (from day 8)', price: 3, duration: 45, description: 'per nail / pro Nagel', variable: true },
    { id: 'removal', name: 'Removal', price: 30, duration: 90, description: 'Removal service / Entfernen' },
    { id: 'eyebrow-threading', name: 'Eyebrow Threading', price: 10, duration: 15, description: 'Threading / Fadentechnik' },
    { id: 'upper-lip', name: 'Upper Lip Threading', price: 5, duration: 10, description: 'Threading / Fadentechnik' }
  ];

  const addOns = [
    { id: 'french-babyboomer', name: 'French / Babyboomer', price: 5 },
    { id: 'simple-nail-art', name: 'Simple Nail Art', price: 5 },
    { id: 'formkorrektur', name: 'Formkorrektur', price: 2, variable: true, description: 'per nail / pro Nagel' }
  ];

  const salonInfo = {
    name: 'Nailscape',
    subtitle: 'Nails & Brows',
    phone: '+49 15259643211',
    email: 'nailscape.de@gmail.com',
    hours: '9:00 AM - 4:00 PM',
    address: 'Herzogenaurach, Germany',
    confirmationMsg: 'Thank you for booking an appointment. Please get back to me for any questions regarding the service. Looking forward for our appointment.'
  };

  // ===== UTILITY FUNCTIONS =====
  const isDateBlocked = (dateStr) => {
    return blockedDates.some(bd => bd.date === dateStr);
  };

  const getAvailableTimeslots = (dateStr) => {
    if (!dateStr || isDateBlocked(dateStr)) return [];
    
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    
    // Only weekdays (1-5) and Saturday (6)
    if (dayOfWeek === 0) return [];
    
    const slots = [];
    const startHour = 9;
    const endHour = 16;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    
    return slots;
  };

  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2); // Minimum 24 hours = next day at earliest
    return date.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 60);
    return date.toISOString().split('T')[0];
  };

  const calculateTotalPrice = () => {
    if (!bookingForm.serviceMain) return 0;
    const mainService = mainServices.find(s => s.id === bookingForm.serviceMain);
    let total = 0;
    
    if (mainService.variable && mainService.id === 'nail-repair') {
      total = mainService.price * bookingForm.nailsForRepair;
    } else if (mainService.variable && mainService.id === 'formkorrektur') {
      total = mainService.price;
    } else {
      total = mainService.price;
    }
    
    // Add-ons
    bookingForm.addOns.forEach(addonId => {
      const addon = addOns.find(a => a.id === addonId);
      if (addon) total += addon.price;
    });
    
    return total;
  };

  const handleAddOnToggle = (addonId) => {
    setBookingForm(prev => ({
      ...prev,
      addOns: prev.addOns.includes(addonId)
        ? prev.addOns.filter(id => id !== addonId)
        : [...prev.addOns, addonId]
    }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!bookingForm.customerName || !bookingForm.customerEmail || !bookingForm.customerPhone || !bookingForm.bookingDate || !bookingForm.serviceMain) {
      alert('Please fill in all required fields');
      return;
    }
    
    const booking = {
      id: Date.now(),
      ...bookingForm,
      totalPrice: calculateTotalPrice(),
      status: 'confirmed',
      createdAt: new Date().toLocaleString('de-DE')
    };
    
    setAllBookings(prev => [...prev, booking]);
    
    // Simulate sending WhatsApp and Email
    console.log('Booking created:', booking);
    console.log('Would send WhatsApp to:', salonInfo.phone);
    console.log('Would send Email to:', salonInfo.email);
    
    // Show success message
    setSubmittedMessage('✓ Booking confirmed! We will contact you shortly.');
    
    // Reset form
    setBookingForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      bookingDate: '',
      serviceMain: '',
      nailsForRepair: 1,
      addOns: [],
      message: ''
    });
    
    setTimeout(() => setSubmittedMessage(''), 5000);
  };

  const handleAddBlockedDate = () => {
    if (newBlockedDate) {
      setBlockedDates(prev => [...prev, { date: newBlockedDate, reason: newBlockedReason }]);
      setNewBlockedDate('');
      setNewBlockedReason('');
    }
  };

  const removeBlockedDate = (dateStr) => {
    setBlockedDates(prev => prev.filter(bd => bd.date !== dateStr));
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    // Default password for demo - change this!
    if (adminPassword === 'nailscape2024') {
      setIsAdminLoggedIn(true);
      setAdminPassword('');
    } else {
      alert('Invalid password');
    }
  };

  // ===== RENDER COMPONENTS =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-pink-50 to-rose-100">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b-4 border-amber-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-pink-200 rounded-full flex items-center justify-center font-bold text-lg text-amber-900">
              NS
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">Nailscape</h1>
              <p className="text-xs text-pink-600">Nails & Brows</p>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={24} className="text-amber-900" />
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4">
            <button
              onClick={() => { setActiveTab('booking'); setIsAdminLoggedIn(false); }}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'booking' && !isAdminLoggedIn
                  ? 'bg-amber-400 text-white'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              Booking
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'admin'
                  ? 'bg-pink-400 text-white'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-amber-50 border-t-2 border-amber-200 p-4 flex flex-col gap-2">
            <button
              onClick={() => { setActiveTab('booking'); setIsAdminLoggedIn(false); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-2 rounded-lg text-left font-semibold transition ${
                activeTab === 'booking' && !isAdminLoggedIn
                  ? 'bg-amber-400 text-white'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              Booking
            </button>
            <button
              onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-2 rounded-lg text-left font-semibold transition ${
                activeTab === 'admin'
                  ? 'bg-pink-400 text-white'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              Admin
            </button>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* BOOKING TAB */}
        {activeTab === 'booking' && !isAdminLoggedIn && (
          <div className="grid md:grid-cols-3 gap-8">
            {/* LEFT: SERVICE MENU & INFO */}
            <div className="md:col-span-1">
              {/* ANNOUNCEMENT SECTION */}
              {announcement && (
                <div className="mb-6 bg-gradient-to-r from-blue-100 to-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-md">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 text-sm">Announcement</p>
                      <p className="text-blue-800 text-sm mt-1">{announcement}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTACT CARD */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-amber-200 mb-6">
                <div className="bg-gradient-to-r from-amber-400 to-pink-300 p-6">
                  <h3 className="text-white font-bold text-lg">Contact Us</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-pink-500" />
                    <div>
                      <p className="text-xs text-gray-500">WhatsApp</p>
                      <a href={`https://wa.me/49152596432211`} target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-900 hover:text-pink-600">
                        {salonInfo.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-pink-500" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <a href={`mailto:${salonInfo.email}`} className="font-semibold text-amber-900 hover:text-pink-600">
                        {salonInfo.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-pink-500" />
                    <div>
                      <p className="text-xs text-gray-500">Hours</p>
                      <p className="font-semibold text-amber-900">{salonInfo.hours}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-pink-500" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-semibold text-amber-900">{salonInfo.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SERVICES MENU */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
                <h3 className="text-lg font-bold text-amber-900 mb-4">Services & Pricing</h3>
                <div className="space-y-3 text-sm">
                  {mainServices.map(service => (
                    <div key={service.id} className="pb-3 border-b border-amber-100 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-amber-900">{service.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <p className="font-bold text-pink-600">{service.price}€</p>
                          <p className="text-xs text-gray-500">{service.duration} min</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 mt-3 border-t-2 border-amber-300">
                    <p className="font-bold text-amber-900 mb-2">Add-Ons</p>
                    {addOns.map(addon => (
                      <div key={addon.id} className="text-xs flex justify-between py-1">
                        <span className="text-gray-700">{addon.name}</span>
                        <span className="font-semibold text-pink-600">+{addon.price}€</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: BOOKING FORM */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-pink-200">
                <h2 className="text-2xl font-bold text-amber-900 mb-2">Book an Appointment</h2>
                <p className="text-gray-600 mb-6">Minimum 24 hours in advance • Weekdays & Saturdays</p>

                {submittedMessage && (
                  <div className="mb-6 bg-green-100 border-l-4 border-green-500 p-4 rounded flex items-center gap-3">
                    <Check size={20} className="text-green-600" />
                    <p className="text-green-800 font-semibold">{submittedMessage}</p>
                  </div>
                )}

                <form onSubmit={handleBooking} className="space-y-6">
                  {/* CUSTOMER INFO */}
                  <div className="border-b-2 border-pink-100 pb-6">
                    <h3 className="font-bold text-amber-900 mb-4">Your Information</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={bookingForm.customerName}
                        onChange={(e) => setBookingForm({...bookingForm, customerName: e.target.value})}
                        className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-pink-400"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email *"
                        value={bookingForm.customerEmail}
                        onChange={(e) => setBookingForm({...bookingForm, customerEmail: e.target.value})}
                        className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-pink-400"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        value={bookingForm.customerPhone}
                        onChange={(e) => setBookingForm({...bookingForm, customerPhone: e.target.value})}
                        className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-pink-400"
                        required
                      />
                    </div>
                  </div>

                  {/* SERVICE SELECTION */}
                  <div className="border-b-2 border-pink-100 pb-6">
                    <h3 className="font-bold text-amber-900 mb-4">Select Service *</h3>
                    <div className="space-y-2">
                      {mainServices.map(service => (
                        <label key={service.id} className="flex items-center p-3 border-2 border-amber-200 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                          <input
                            type="radio"
                            name="service"
                            value={service.id}
                            checked={bookingForm.serviceMain === service.id}
                            onChange={(e) => setBookingForm({...bookingForm, serviceMain: e.target.value})}
                            className="w-4 h-4"
                            required
                          />
                          <div className="ml-3 flex-1">
                            <p className="font-semibold text-amber-900">{service.name}</p>
                            <p className="text-sm text-gray-600">{service.duration} min • {service.price}€</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* NAIL REPAIR SPECIAL FIELD */}
                  {bookingForm.serviceMain === 'nail-repair' && (
                    <div className="border-b-2 border-pink-100 pb-6">
                      <h3 className="font-bold text-amber-900 mb-4">How many nails need repair? *</h3>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={bookingForm.nailsForRepair}
                        onChange={(e) => setBookingForm({...bookingForm, nailsForRepair: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-pink-400"
                      />
                      <p className="text-sm text-gray-600 mt-2">Price: {bookingForm.nailsForRepair} × 3€ = {bookingForm.nailsForRepair * 3}€</p>
                    </div>
                  )}

                  {/* ADD-ONS */}
                  <div className="border-b-2 border-pink-100 pb-6">
                    <h3 className="font-bold text-amber-900 mb-4">Add-Ons (Optional)</h3>
                    <div className="space-y-2">
                      {addOns.map(addon => (
                        <label key={addon.id} className="flex items-center p-3 border-2 border-amber-200 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                          <input
                            type="checkbox"
                            checked={bookingForm.addOns.includes(addon.id)}
                            onChange={() => handleAddOnToggle(addon.id)}
                            className="w-4 h-4"
                          />
                          <div className="ml-3 flex-1">
                            <p className="font-semibold text-amber-900">{addon.name}</p>
                            {addon.description && <p className="text-sm text-gray-600">{addon.description}</p>}
                          </div>
                          <span className="text-pink-600 font-bold ml-2">+{addon.price}€</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* DATE & TIME */}
                  <div className="border-b-2 border-pink-100 pb-6">
                    <h3 className="font-bold text-amber-900 mb-4">Date & Time *</h3>
                    <input
                      type="date"
                      value={bookingForm.bookingDate}
                      onChange={(e) => setBookingForm({...bookingForm, bookingDate: e.target.value})}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-pink-400 mb-4"
                      required
                    />
                    {bookingForm.bookingDate && isDateBlocked(bookingForm.bookingDate) && (
                      <div className="flex items-center gap-2 text-red-600 mb-4">
                        <X size={18} />
                        <p className="text-sm font-semibold">Salon is closed on this date</p>
                      </div>
                    )}
                  </div>

                  {/* MESSAGE */}
                  <div className="pb-6">
                    <h3 className="font-bold text-amber-900 mb-4">Message (Optional)</h3>
                    <textarea
                      placeholder="Add any special requests or notes..."
                      value={bookingForm.message}
                      onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-pink-400 h-20 resize-none"
                    />
                  </div>

                  {/* PRICE SUMMARY */}
                  <div className="bg-gradient-to-r from-amber-100 to-pink-100 p-4 rounded-lg border-2 border-amber-300">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-900">Total Price:</span>
                      <span className="text-3xl font-bold text-pink-600">{calculateTotalPrice()}€</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Payment at salon</p>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold py-3 rounded-lg hover:from-pink-500 hover:to-rose-500 transition shadow-lg"
                  >
                    Confirm Booking
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === 'admin' && (
          <div className="max-w-2xl mx-auto">
            {!isAdminLoggedIn ? (
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-pink-200">
                <h2 className="text-2xl font-bold text-amber-900 mb-6">Admin Login</h2>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-400"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold py-3 rounded-lg hover:from-pink-500 hover:to-rose-500 transition"
                  >
                    Login
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-4">Demo password: nailscape2024</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* HEADER */}
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-amber-900">Admin Dashboard</h2>
                  <button
                    onClick={() => setIsAdminLoggedIn(false)}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>

                {/* ANNOUNCEMENT SECTION */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">📢 Public Announcement</h3>
                  {!editingAnnouncement ? (
                    <>
                      {announcement ? (
                        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mb-4">
                          <p className="text-blue-900">{announcement}</p>
                        </div>
                      ) : (
                        <p className="text-gray-500 mb-4">No announcement set</p>
                      )}
                      <button
                        onClick={() => setEditingAnnouncement(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                      >
                        {announcement ? 'Edit' : 'Add'} Announcement
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                        placeholder="Enter announcement message (leave blank to remove)..."
                        className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 h-24 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingAnnouncement(false)}
                          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingAnnouncement(false);
                            setAnnouncement(announcement);
                          }}
                          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* BLOCKED DATES SECTION */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-200">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">🚫 Block Dates/Hours</h3>
                  <p className="text-sm text-gray-600 mb-4">Block dates when salon is closed (vacation, special events, etc.)</p>
                  
                  <div className="space-y-3 mb-4">
                    <input
                      type="date"
                      value={newBlockedDate}
                      onChange={(e) => setNewBlockedDate(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-400"
                    />
                    <input
                      type="text"
                      placeholder="Reason (e.g., Vacation, Maintenance, Holiday)"
                      value={newBlockedReason}
                      onChange={(e) => setNewBlockedReason(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-400"
                    />
                    <button
                      onClick={handleAddBlockedDate}
                      className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                    >
                      Block This Date
                    </button>
                  </div>

                  {blockedDates.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-700">Blocked Dates:</p>
                      {blockedDates.map(bd => (
                        <div key={bd.date} className="flex justify-between items-center bg-red-50 p-3 rounded-lg border border-red-200">
                          <div>
                            <p className="font-semibold text-red-900">{new Date(bd.date).toLocaleDateString('de-DE')}</p>
                            {bd.reason && <p className="text-sm text-red-700">{bd.reason}</p>}
                          </div>
                          <button
                            onClick={() => removeBlockedDate(bd.date)}
                            className="text-red-600 hover:text-red-800 transition"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* BOOKINGS LIST */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">📋 Recent Bookings ({allBookings.length})</h3>
                  {allBookings.length === 0 ? (
                    <p className="text-gray-500">No bookings yet</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {[...allBookings].reverse().map(booking => (
                        <div key={booking.id} className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-600">Name</p>
                              <p className="font-semibold text-amber-900">{booking.customerName}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Date</p>
                              <p className="font-semibold text-amber-900">{new Date(booking.bookingDate).toLocaleDateString('de-DE')}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Phone</p>
                              <p className="font-semibold text-amber-900">{booking.customerPhone}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Price</p>
                              <p className="font-semibold text-pink-600">{booking.totalPrice}€</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-gray-600">Service</p>
                              <p className="font-semibold text-amber-900">{mainServices.find(s => s.id === booking.serviceMain)?.name}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* QUICK SETUP GUIDE */}
                <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300">
                  <h3 className="text-lg font-bold text-amber-900 mb-3">⚙️ Setup Instructions</h3>
                  <div className="text-sm text-amber-900 space-y-2">
                    <p><strong>1. Change Admin Password:</strong> Edit the password in the code (default: nailscape2024)</p>
                    <p><strong>2. Update Services:</strong> Edit services, prices, and durations in the code</p>
                    <p><strong>3. Enable Notifications:</strong> Currently showing demo. You'll need to integrate:</p>
                    <ul className="list-disc list-inside ml-2 text-amber-800">
                      <li>Email service (SendGrid, Gmail API)</li>
                      <li>WhatsApp service (Twilio API)</li>
                      <li>Google Sheets API (to store bookings)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NailscapeBookingTool;
