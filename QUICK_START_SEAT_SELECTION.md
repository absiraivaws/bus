# Quick Start Guide - Seat Selection Feature

## 🎯 How to Test the New Seat Selection Feature

### Step 1: Search for a Trip
1. Go to **http://localhost:3000**
2. Select **From:** Colombo
3. Select **To:** Kandy (or Galle)
4. Choose **Date:** Today or any date in the next 7 days
5. Click **"Search Trips"**

### Step 2: Select a Trip
- You'll see available trips with pricing
- Click **"Select"** button on any trip

### Step 3: Interactive Seat Selection 🎨

You'll now see the **NEW Interactive Seat Selection Page** with:

#### Left Side - Seat Layout
```
┌─────────────────────────────────┐
│  Trip Summary                   │
│  Colombo → Kandy                │
│  Price per Seat: $500           │
├─────────────────────────────────┤
│  Legend:                        │
│  🟢 Available  🔵 Selected      │
│  🔴 Reserved   🟠 Pending       │
├─────────────────────────────────┤
│                                 │
│     🚗  [Driver Seat]           │
│                                 │
│  01🪟  02   03   04🪟          │
│  05🪟  06   07   08🪟          │
│  09🪟  10   11   12🪟          │
│  13🪟  14   15   16🪟          │
│   ...                           │
│                                 │
│  Selected: 01, 05, 09           │
└─────────────────────────────────┘
```

#### Right Side - Billing & Form
```
┌─────────────────────────────────┐
│  Fare Breakdown                 │
├─────────────────────────────────┤
│  Seats Selected:           3    │
│  Price per Seat:      $500.00   │
│  ─────────────────────────────  │
│  Subtotal (3×$500):  $1500.00   │
│  Convenience Fee:      $50.00   │
│  ─────────────────────────────  │
│  💰 Total Amount:    $1550.00   │
├─────────────────────────────────┤
│  Booking Details                │
│  Pickup Point:    [Colombo ▼]   │
│  Dropoff Point:   [Kandy ▼]     │
│  Full Name:       [_________]   │
│  Email:           [_________]   │
│                                 │
│  [Proceed to Payment $1550.00]  │
└─────────────────────────────────┘
```

### Step 4: Select Your Seats
1. **Click on green seats** to select them
2. Selected seats turn **blue** with a glow effect
3. **Click again** to deselect
4. Watch the **bill update in real-time**

### Step 5: Fill Booking Details
1. Choose **Pickup Point** (default: starting location)
2. Choose **Dropoff Point** (default: ending location)
3. Enter **Full Name**
4. Enter **Email**

### Step 6: Proceed to Payment
- Click **"Proceed to Payment"** button
- You'll be redirected to payment page

---

## 🎨 Seat Color Guide

| Color | Icon | Status | Can Select? |
|-------|------|--------|-------------|
| 🟢 Green | - | Available | ✅ Yes |
| 🔵 Blue | - | Selected by you | ✅ Yes (to deselect) |
| 🔴 Red | - | Reserved/Booked | ❌ No |
| 🟠 Orange | - | Pending payment | ❌ No |
| ⚫ Gray | 🚗 | Driver seat | ❌ No |
| 🔲 Dashed | - | Empty space | ❌ No |

**Special Indicators:**
- 🪟 = Window seat (on first and last columns)
- 🚗 = Driver seat (top right)
- Highlighted border = First row seats

---

## 💰 Billing Calculation

**Example 1: Single Seat**
```
1 seat × $500 = $500
Convenience Fee = $50
─────────────────────
Total = $550
```

**Example 2: Multiple Seats**
```
3 seats × $500 = $1,500
Convenience Fee = $50
─────────────────────
Total = $1,550
```

**Example 3: Different Route**
```
2 seats × $650 = $1,300
Convenience Fee = $50
─────────────────────
Total = $1,350
```

---

## 🧪 Test Scenarios

### Scenario 1: Normal Booking
1. Select 2-3 seats
2. Fill in details
3. Click "Proceed to Payment"
4. ✅ Should redirect to payment page

### Scenario 2: Reserved Seats
1. Complete a booking (Scenario 1)
2. Go back to the same trip
3. Try to select the same seats
4. ✅ Those seats should appear RED (reserved)
5. ✅ Cannot select them

### Scenario 3: Real-time Bill Update
1. Select 1 seat → Bill shows $550
2. Select 2 more seats → Bill shows $1,550
3. Deselect 1 seat → Bill shows $1,050
4. ✅ Bill updates instantly

### Scenario 4: Validation
1. Don't select any seats
2. Try to submit
3. ✅ Button should be disabled
4. ✅ Button text: "Select Seats to Continue"

---

## 🚀 Quick Test Commands

**View the homepage:**
```bash
open http://localhost:3000
```

**Direct link to a trip booking:**
```bash
# Get a trip ID from the search results, then:
open http://localhost:3000/book/[TRIP_ID]
```

**Check if server is running:**
```bash
curl http://localhost:3000
```

---

## ✨ Features Implemented

✅ Interactive seat grid matching vehicle layout  
✅ Click to select/deselect seats  
✅ 4 color-coded seat statuses  
✅ Real-time billing calculation  
✅ Convenience fee ($50)  
✅ Detailed fare breakdown  
✅ Window seat indicators (🪟)  
✅ Driver seat display (🚗)  
✅ Reserved seat prevention  
✅ Smooth animations & hover effects  
✅ Form validation  
✅ Responsive design  

---

## 📱 Mobile View

The layout automatically adapts for mobile:
- Seat grid stacks on top
- Billing panel moves below
- Touch-friendly seat buttons
- Scrollable seat area

---

**Need Help?** Check `SEAT_SELECTION_FEATURE.md` for detailed technical documentation.

**Server Running:** http://localhost:3000  
**Status:** ✅ Ready to test!
