// ============== DATA MANAGEMENT ==============
const STORAGE_KEY = {
    ROOMS: 'hotel_rooms',
    BOOKINGS: 'hotel_bookings',
    BILLING: 'hotel_billing'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadRoomDropdowns();
    updateDashboard();
    loadAllData();
});

// ============== EVENT LISTENERS ==============
function setupEventListeners() {
    document.getElementById('roomForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addRoom();
    });

    document.getElementById('bookingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        createBooking();
    });

    document.getElementById('checkInForm').addEventListener('submit', (e) => {
        e.preventDefault();
        checkInGuest();
    });

    document.getElementById('chargesForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addCharges();
    });

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkInDate').min = today;
    document.getElementById('checkOutDate').min = today;
}

// ============== SECTION NAVIGATION ==============
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section
    document.getElementById(sectionId).classList.remove('hidden');

    // Update data on section load
    if (sectionId === 'dashboard') updateDashboard();
    if (sectionId === 'rooms') displayRooms();
    if (sectionId === 'booking') {
        displayBookings();
        loadRoomDropdowns();
    }
    if (sectionId === 'checkIn') displayCheckIns();
    if (sectionId === 'billing') displayBilling();
}

// ============== ROOM MANAGEMENT ==============
function addRoom() {
    const room = {
        id: Date.now().toString(),
        number: document.getElementById('roomNumber').value,
        type: document.getElementById('roomType').value,
        price: parseFloat(document.getElementById('roomPrice').value),
        capacity: parseInt(document.getElementById('roomCapacity').value),
        status: 'available'
    };

    let rooms = JSON.parse(localStorage.getItem(STORAGE_KEY.ROOMS)) || [];
    rooms.push(room);
    localStorage.setItem(STORAGE_KEY.ROOMS, JSON.stringify(rooms));

    document.getElementById('roomForm').reset();
    displayRooms();
    loadRoomDropdowns();
    updateDashboard();

    alert('✅ Room added successfully!');
}

function displayRooms() {
    const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY.ROOMS)) || [];
    const tbody = document.getElementById('roomsTableBody');

    if (rooms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No rooms added yet</td></tr>';
        return;
    }

    tbody.innerHTML = rooms.map(room => `
        <tr>
            <td>${room.number}</td>
            <td>${room.type}</td>
            <td>$${room.price.toFixed(2)}</td>
            <td>${room.capacity}</td>
            <td><span class="status ${room.status}">${room.status.charAt(0).toUpperCase() + room.status.slice(1)}</span></td>
            <td>
                <a class="action-link" onclick="editRoom('${room.id}')">Edit</a>
                <a class="action-link delete" onclick="deleteRoom('${room.id}')">Delete</a>
            </td>
        </tr>
    `).join('');
}

function deleteRoom(roomId) {
    if (confirm('Are you sure you want to delete this room?')) {
        let rooms = JSON.parse(localStorage.getItem(STORAGE_KEY.ROOMS)) || [];
        rooms = rooms.filter(r => r.id !== roomId);
        localStorage.setItem(STORAGE_KEY.ROOMS, JSON.stringify(rooms));
        displayRooms();
        updateDashboard();
        alert('✅ Room deleted!');
    }
}

function loadRoomDropdowns() {
    const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY.ROOMS)) || [];
    const availableRooms = rooms.filter(r => r.status === 'available');

    const select = document.getElementById('bookingRoomSelect');
    select.innerHTML = '<option value="">Select Available Room</option>' +
        availableRooms.map(room => 
            `<option value="${room.id}" data-price="${room.price}">${room.number} - ${room.type} ($${room.price}/night)</option>`
        ).join('');
}

// ============== BOOKING MANAGEMENT ==============
function createBooking() {
    const roomSelect = document.getElementById('bookingRoomSelect');
    const selectedOption = roomSelect.options[roomSelect.selectedIndex];

    if (!selectedOption.value) {
        alert('Please select a room');
        return;
    }

    const checkInDate = new Date(document.getElementById('checkInDate').value);
    const checkOutDate = new Date(document.getElementById('checkOutDate').value);

    if (checkOutDate <= checkInDate) {
        alert('Check-out date must be after check-in date');
        return;
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    const booking = {
        id: 'BK' + Date.now().toString().slice(-8),
        guestName: document.getElementById('guestName').value,
        guestEmail: document.getElementById('guestEmail').value,
        guestPhone: document.getElementById('guestPhone').value,
        roomId: roomSelect.value,
        checkInDate: document.getElementById('checkInDate').value,
        checkOutDate: document.getElementById('checkOutDate').value,
        numGuests: parseInt(document.getElementById('numGuests').value),
        specialRequests: document.getElementById('specialRequests').value,
        status: 'confirmed',
        nights: nights,
        roomCharge: nights * parseFloat(selectedOption.dataset.price),
        additionalCharges: 0,
        createdAt: new Date().toISOString()
    };

    let bookings = JSON.parse(localStorage.getItem(STORAGE_KEY.BOOKINGS)) || [];
    bookings.push(booking);
    localStorage.setItem(STORAGE_KEY.BOOKINGS, JSON.stringify(bookings));

    // Update room status
    updateRoomStatus(roomSelect.value, 'occupied');

    document.getElementById('bookingForm').reset();
    displayBookings();
    loadRoomDropdowns();
    updateDashboard();

    alert(`✅ Booking created! Booking ID: ${booking.id}`);
}

function displayBookings() {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEY.BOOKINGS)) || [];
    const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY.ROOMS)) || [];
    const tbody = document.getElementById('bookingsTableBody');

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No bookings yet</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map(booking => {
        const room = rooms.find(r => r.id === booking.roomId);
        return `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.guestName}</td>
                <td>${room ? room.number : 'N/A'}</td>
                <td>${booking.checkInDate}</td>
                <td>${booking.checkOutDate}</td>
                <td><span class="status ${booking.status.toLowerCase()}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span></td>
                <td>
                    <a class="action-link" onclick="viewBooking('${booking.id}')">View</a>
                    <a class="action-link delete" onclick="cancelBooking('${booking.id}')">Cancel</a>
                </td>
            </tr>
        `;
    }).join('');
}

function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        let bookings = JSON.parse(localStorage.getItem(STORAGE_KEY.BOOKINGS)) || [];
        const booking = bookings.find(b => b.id === bookingId);

        if (booking) {
            updateRoomStatus(booking.roomId, 'available');
            booking.status = 'cancelled';
            localStorage.setItem(STORAGE_KEY.BOOKINGS, JSON.stringify(bookings));
            displayBookings();
            updateDashboard();
            alert('✅ Booking cancelled!');
        }
    }
}

function viewBooking(bookingId) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEY.BOOKINGS)) || [];
    const booking = bookings.find(b => b.id === bookingId);

    if (booking) {
        alert(`Booking Details:\nGuest: ${booking.guestName}\nEmail: ${booking.guestEmail}\nPhone: ${booking.guestPhone}\nCheck-in: ${booking.checkInDate}\nCheck-out: ${booking.checkOutDate}\nGuests: ${booking.numGuests}`);
    }
}

// ============== CHECK-IN/CHECK-OUT ==============
function checkInGuest() {
    const bookingId = document.getElementById('checkInBookingId').value;
    const notes = document.getElementById('checkInNotes').value;

    let bookings = JSON.parse(localStorage.getItem(STORAGE_KEY.BOOKINGS)) || [];
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
        alert('❌ Booking not found!');
        return;
    }

    booking.status = 'checked-in';
    booking.checkInNotes = notes;
    booking.checkInTime = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY.BOOKINGS, JSON.stringify(bookings));
    document.getElementById('checkInForm').reset();
    displayCheckIns();
    updateDashboard();

    alert(`✅ Guest ${booking.guestName} checked in!`);
}

function displayCheckIns() {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEY.BOOKINGS)) || [];
    const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY.ROOMS)) || [];
    const tbody = document.getElementById('checkinTableBody');

    const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in');

    if (activeBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No active bookings</td></tr>';
        return;
    }

    tbody.innerHTML = activeBookings.map(booking => {
        const room = rooms.find(r => r.id === booking.roomId);
        return `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.guestName}</td>
                <td>${room ? room.number : 'N/A'}</td>
                <td>${booking.checkInDate}</td>
                <td>${booking.checkOutDate}</td>
                <td><span class="status ${booking.status.toLowerCase()}">${booking.status === 'checked-in' ? 'Checked In' : 'Pending Check-in'}</span></td>
                <td>
                    ${booking.status === 'confirmed' ? 
                        `<a class="action-link" onclick="document.getElementById('checkInBookingId').value='${booking.id}'; document.getElementById('checkInForm').focus();">Check-In</a>` 
                        : 
                        `<a class="action-link" onclick="checkOutGuest('${booking.id}')">Check-Out</a>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

function checkOutGuest(bookingId) {
    if (confirm('Check out this guest?')) {
        let bookings = JSON.parse(localStorage.getItem(STORAGE_KEY.BOOKINGS)) || [];
        const booking = bookings.find(b => b.id === bookingId);

        if (booking) {
            booking.status = 'completed';
            booking.checkOutTime = new Date().toISOString();
            updateRoomStatus(booking.roomId, 'available');
            localStorage.setItem(STORAGE_KEY.BOOKINGS, JSON.stringify(bookings));
            displayCheckIns();
            updateDashboard();
            alert('✅ Guest checked out! Generate invoice now.');
        }
    }
}

// ============== BILLING & INVOICES ==============
function addCharges() {
    const bookingId = document.getElementById('chargesBookingId').value;
    const serviceName = document.getElementById('serviceName').value;
    const amount = parseFloat(document.getElementById('chargesAmount').value);

    let bookings = JSON.parse(localStorage.getItem(STORAGE_KEY.BOOKINGS)) || [];
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
        alert('❌ Booking not found!');
        return;
    }

    booking.additionalCharges = (booking.additionalCharges || 0) + amount;
    
    if (!booking.services) booking.services = [];
    booking.services.push({
        name: serviceName,
        amount: amount,
        date: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEY.BOOKINGS, JSON.stringify(bookings));
    document.getElementById('chargesForm').reset();
    displayBilling();
    updateDashboard();

    alert(`✅ Charge of $${amount} added for ${serviceName}`);
}

function displayBilling() {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEY.BOOKINGS)) || [];
    const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY.ROOMS)) || [];
    const tbody = document.getElementById('billingTableBody');

    const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'checked-in');

    if (completedBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center">No invoices yet</td></tr>';
        return;
    }

    tbody.innerHTML = completedBookings.map(booking => {
        const room = rooms.find(r => r.id === booking.roomId);
        const tax = (booking.roomCharge + (booking.additionalCharges || 0)) * 0.1;
        const total = booking.roomCharge + (booking.additionalCharges || 0) + tax;

        return `
            <tr>
                <td>INV-${booking.id}</td>
                <td>${booking.guestName}</td>
                <td>${room ? room.number : 'N/A'}</td>
                <td>${booking.nights}</td>
                <td>$${booking.roomCharge.toFixed(2)}</td>
                <td>$${(booking.additionalCharges || 0).toFixed(2)}</td>
                <td>$${tax.toFixed(2)}</td>
                <td><strong>$${total.toFixed(2)}</strong></td>
                <td><span class="status confirmed">Pending</span></td>
                <td>
                    <a class="action-link" onclick="viewInvoice('${booking.id}')">View</a>
                </td>
            </tr>
        `;
    }).join('');
}

function viewInvoice(bookingId) {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEY.BOOKINGS)) || [];
    const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY.ROOMS)) || [];
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
        alert('Booking not found!');
        return;
    }

    const room = rooms.find(r => r.id === booking.roomId);
    const tax = (booking.roomCharge + (booking.additionalCharges || 0)) * 0.1;
    const total = booking.roomCharge + (booking.additionalCharges || 0) + tax;

    const invoiceHTML = `
        <div class="invoice-container" id="printableInvoice">
            <div class="invoice-header">
                <div>
                    <h2 class="invoice-title">🏨 HotelPro Invoice</h2>
                    <p class="invoice-id">Invoice: INV-${booking.id}</p>
                </div>
                <div>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <span class="status confirmed">Pending Payment</span></p>
                </div>
            </div>

            <div class="invoice-details">
                <div>
                    <div class="invoice-section">
                        <h4>Guest Information</h4>
                        <p><strong>${booking.guestName}</strong></p>
                        <p>Email: ${booking.guestEmail}</p>
                        <p>Phone: ${booking.guestPhone}</p>
                    </div>
                </div>
                <div>
                    <div class="invoice-section">
                        <h4>Booking Details</h4>
                        <p><strong>Room:</strong> ${room ? room.number + ' (' + room.type + ')' : 'N/A'}</p>
                        <p><strong>Check-in:</strong> ${booking.checkInDate}</p>
                        <p><strong>Check-out:</strong> ${booking.checkOutDate}</p>
                        <p><strong>Nights:</strong> ${booking.nights}</p>
                    </div>
                </div>
            </div>

            <div class="invoice-charges">
                <table class="charges-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Room Charge (${booking.nights} nights × $${(booking.roomCharge / booking.nights).toFixed(2)})</td>
                            <td style="text-align: right;">$${booking.roomCharge.toFixed(2)}</td>
                        </tr>
                        ${booking.services && booking.services.length > 0 ? 
                            booking.services.map(service => 
                                `<tr><td>${service.name}</td><td style="text-align: right;">$${service.amount.toFixed(2)}</td></tr>`
                            ).join('') 
                            : ''
                        }
                        <tr style="border-top: 2px solid #ddd;">
                            <td><strong>Subtotal</strong></td>
                            <td style="text-align: right;"><strong>$${(booking.roomCharge + (booking.additionalCharges || 0)).toFixed(2)}</strong></td>
                        </tr>
                        <tr>
                            <td><strong>Tax (10%)</strong></td>
                            <td style="text-align: right;"><strong>$${tax.toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="invoice-total">
                <div class="total-box">
                    <div>
                        <strong>Total Due:</strong>
                        <span class="grand-total">$${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; color: #999; font-size: 0.9rem;">
                <p>Thank you for choosing HotelPro! Please pay within 7 days of check-out.</p>
                <p>For inquiries, contact: support@hotelpro.com | Phone: +1-800-HOTEL</p>
            </div>
        </div>
    `;

    document.getElementById('invoiceContent').innerHTML = invoiceHTML;
    document.getElementById('invoiceModal').classList.remove('hidden');
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal').classList.add('hidden');
}

function printInvoice() {
    window.print();
}

function downloadInvoice() {
    alert('📥 Invoice download feature - Use browser print to PDF');
}

// ============== DASHBOARD ==============
function updateDashboard() {
    const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY.ROOMS)) || [];
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEY.BOOKINGS)) || [];

    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const totalBookings = bookings.filter(b => b.status !== 'cancelled').length;

    let totalRevenue = 0;
    bookings.forEach(b => {
        if (b.status === 'completed') {
            totalRevenue += b.roomCharge + (b.additionalCharges || 0);
        }
    });

    const today = new Date().toISOString().split('T')[0];
    const todayCheckIns = bookings.filter(b => b.checkInDate === today && b.status === 'confirmed').length;

    document.getElementById('totalRoomsCount').textContent = rooms.length;
    document.getElementById('availableRoomsCount').textContent = availableRooms;
    document.getElementById('occupiedRoomsCount').textContent = occupiedRooms;
    document.getElementById('totalBookingsCount').textContent = totalBookings;
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toFixed(2);
    document.getElementById('todayCheckinsCount').textContent = todayCheckIns;
}

// ============== LOAD ALL DATA ==============
function loadAllData() {
    displayRooms();
    displayBookings();
    displayCheckIns();
    displayBilling();
}

// ============== UTILITY FUNCTIONS ==============
function updateRoomStatus(roomId, status) {
    let rooms = JSON.parse(localStorage.getItem(STORAGE_KEY.ROOMS)) || [];
    const room = rooms.find(r => r.id === roomId);
    if (room) {
        room.status = status;
        localStorage.setItem(STORAGE_KEY.ROOMS, JSON.stringify(rooms));
    }
}

function initializeSampleData() {
    // Sample rooms
    const sampleRooms = [
        { id: '1', number: '101', type: 'Single', price: 100, capacity: 1, status: 'available' },
        { id: '2', number: '102', type: 'Double', price: 150, capacity: 2, status: 'available' },
        { id: '3', number: '103', type: 'Suite', price: 250, capacity: 4, status: 'available' },
        { id: '4', number: '201', type: 'Double', price: 150, capacity: 2, status: 'available' },
        { id: '5', number: '202', type: 'Deluxe', price: 300, capacity: 3, status: 'available' }
    ];

    localStorage.setItem(STORAGE_KEY.ROOMS, JSON.stringify(sampleRooms));
    displayRooms();
    loadRoomDropdowns();
    updateDashboard();

    alert('✅ Sample data loaded! You can now create bookings.');
}

function clearAllData() {
    if (confirm('⚠️ This will delete ALL data. Are you sure?')) {
        localStorage.removeItem(STORAGE_KEY.ROOMS);
        localStorage.removeItem(STORAGE_KEY.BOOKINGS);
        localStorage.removeItem(STORAGE_KEY.BILLING);
        loadAllData();
        updateDashboard();
        alert('✅ All data cleared!');
    }
}