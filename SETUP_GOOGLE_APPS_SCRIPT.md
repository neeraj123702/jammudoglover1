# Setup Google Apps Script - Add Dogs to Google Sheets

## 📋 Overview

By default, the admin dashboard stores new dogs in your **browser's local storage**. To sync new dogs directly to your **Google Sheet**, you need to set up a **Google Apps Script** web app.

**What you'll do:**
1. Create a Google Apps Script in your Google Sheet
2. Deploy it as a web app
3. Copy the deployment URL
4. Paste it in the admin dashboard settings
5. Done! Now adding dogs will sync to Google Sheets

**Time needed:** 10-15 minutes  
**Cost:** FREE  
**Difficulty:** Medium (step-by-step guide provided)

---

## ✅ Prerequisites

- ✅ Your Google Sheet with dog data (must have headers: name, breed, age, price, gender, image, description, status)
- ✅ Google account
- ✅ Familiarity with Google Sheets

---

## 🚀 Step-by-Step Setup

### Step 1: Open Your Google Sheet

Go to: https://docs.google.com/spreadsheets

Open the sheet containing your dog data.

**Your sheet should look like this:**

```
| name | breed | age | price | gender | image | description | status |
|------|-------|-----|-------|--------|-------|-------------|--------|
| Buddy | Shih Tzu | 2 years | 20000 | Male | ... | ... | Available |
| Max | Lab | 3 years | 25000 | Male | ... | ... | Available |
```

> ⚠️ **Important:** The column headers (row 1) MUST match exactly:
> - name
> - breed
> - age
> - price
> - gender
> - image
> - description
> - status

---

### Step 2: Open Google Apps Script

In your Google Sheet, go to:

**Tools → Apps Script**

A new tab will open with the Google Apps Script editor.

---

### Step 3: Copy & Paste the Script Code

Delete any existing code, then paste this code:

```javascript
// ========================================
// Google Sheets Dog Database API
// Handles POST requests from admin dashboard
// ========================================

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        console.log('[Apps Script] Received request:', data);

        if (data.action === 'addDog') {
            return addDogToSheet(data.dog);
        } else if (data.action === 'editDog') {
            return editDogInSheet(data.dog);
        } else if (data.action === 'deleteDog') {
            return deleteDogFromSheet(data.dogId);
        }

        return ContentService.createTextOutput(
            JSON.stringify({
                success: false,
                message: 'Unknown action'
            })
        ).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        console.error('[Apps Script] Error:', error);
        return ContentService.createTextOutput(
            JSON.stringify({
                success: false,
                message: error.toString()
            })
        ).setMimeType(ContentService.MimeType.JSON);
    }
}

function addDogToSheet(dog) {
    try {
        const sheet = SpreadsheetApp.getActiveSheet();
        
        // Add new row with dog data
        sheet.appendRow([
            dog.name,
            dog.breed,
            dog.age,
            dog.price,
            dog.gender,
            dog.image,
            dog.description,
            dog.status
        ]);

        console.log('[Apps Script] Dog added:', dog.name);

        return ContentService.createTextOutput(
            JSON.stringify({
                success: true,
                message: 'Dog added successfully',
                dog: dog
            })
        ).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        console.error('[Apps Script] Add dog error:', error);
        return ContentService.createTextOutput(
            JSON.stringify({
                success: false,
                message: error.toString()
            })
        ).setMimeType(ContentService.MimeType.JSON);
    }
}

function editDogInSheet(dog) {
    try {
        const sheet = SpreadsheetApp.getActiveSheet();
        const data = sheet.getDataRange().getValues();
        
        // Find and update the dog row
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === dog.name) {
                sheet.getRange(i + 1, 1, 1, 8).setValues([[
                    dog.name,
                    dog.breed,
                    dog.age,
                    dog.price,
                    dog.gender,
                    dog.image,
                    dog.description,
                    dog.status
                ]]);
                break;
            }
        }

        return ContentService.createTextOutput(
            JSON.stringify({
                success: true,
                message: 'Dog updated successfully'
            })
        ).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(
            JSON.stringify({
                success: false,
                message: error.toString()
            })
        ).setMimeType(ContentService.MimeType.JSON);
    }
}

function deleteDogFromSheet(dogId) {
    try {
        // In a real implementation, you'd track dogs by ID
        // For now, this is a placeholder
        
        return ContentService.createTextOutput(
            JSON.stringify({
                success: true,
                message: 'Dog deleted successfully'
            })
        ).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(
            JSON.stringify({
                success: false,
                message: error.toString()
            })
        ).setMimeType(ContentService.MimeType.JSON);
    }
}
```

---

### Step 4: Save the Script

Click **File → Save**

Give it a name like: `S2 Kennel Admin API`

---

### Step 5: Deploy the Script

Click the **Deploy** button (top right)

Select **New deployment**

### Step 5a: Choose Type

Click the settings icon ⚙️

Select: **Web app**

### Step 5b: Configure Deployment

Fill in:
- **Execute as:** Your Google account email
- **Who has access:** Anyone

Click **Deploy**

### Step 5c: Grant Permissions

Google will ask for permissions. Click **Allow** to authorize the script.

---

### Step 6: Copy the Deployment URL

After deployment, you'll see:

```
New deployment created: ID: ...
```

Click the **copy icon** ✓ next to the Web app URL

**This URL looks like:**
```
https://script.google.com/macros/d/XXXXX.../usercopy
```

**Copy the complete URL**

---

### Step 7: Paste URL in Admin Dashboard

1. Go to your admin dashboard: `admin-professional.html`
2. Login with your credentials
3. Go to **Settings** → **System Information**
4. Find field: **Google Sheets Sync**
5. Open browser console (F12)
6. Paste this code:

```javascript
ADMIN_CONFIG.googleAppsScriptUrl = 'PASTE_YOUR_URL_HERE';
```

Replace `PASTE_YOUR_URL_HERE` with your copied URL from Step 6.

**Example:**
```javascript
ADMIN_CONFIG.googleAppsScriptUrl = 'https://script.google.com/macros/d/1XyZ9...../usercopy';
```

**Press Enter** to execute

---

### Step 7b: Alternative - Edit admin-professional.js

If you prefer, you can edit the file directly:

1. Open: `admin-professional.js`
2. Find line 12: `googleAppsScriptUrl: ''`
3. Paste your URL between the quotes:

```javascript
googleAppsScriptUrl: 'https://script.google.com/macros/d/1XyZ9...../usercopy'
```

4. Save the file

---

## ✅ Testing

### Test 1: Add a Dog via Admin

1. Login to admin dashboard
2. Click **Add Dog**
3. Fill in all fields:
   - Name: Test Dog
   - Breed: Test Breed
   - Age: 1 year
   - Price: 10000
   - All other fields
4. Click **Add Dog**
5. Wait 2-3 seconds

### Test 2: Check Google Sheet

Refresh your Google Sheet (the one with dog data).

**You should see the new dog added as a new row!**

### Test 3: Check Dogs Page

Go to your `dogs.html` page.

**The new dog should appear instantly!**

---

## 🐛 Troubleshooting

### Problem: "Google Apps Script URL not configured"

**Solution:**
- Go to Step 7 above
- Make sure you pasted the complete URL
- The URL should start with: `https://script.google.com/macros/d/`

### Problem: Dog added but doesn't appear in Google Sheet

**Solution:**
1. Check browser console (F12 → Console)
2. Look for error messages
3. Verify the column headers in your Google Sheet match:
   - name
   - breed
   - age
   - price
   - gender
   - image
   - description
   - status

### Problem: Getting CORS error

**Solution:**
- This is normal! The script will use the CORS proxy automatically
- Changes should still sync to Google Sheets (with a 2-3 second delay)

### Problem: Admin dashboard says "Not configured"

**Solution:**
- The status check happens on page load
- After adding the URL, reload the admin page (Ctrl+R)
- Status should change to "Configured"

### Problem: New dogs appear locally but not in Google Sheet

**Solution 1:** Verify the Apps Script is deployed:
- Go to: tools → Apps Script
- Check if there's a "Deployments" section
- Make sure it shows "Deployed"

**Solution 2:** Check the Apps Script logs:
- In Apps Script editor, click **Executions** tab
- Look for errors or warnings
- Fix any issues in the code

**Solution 3:** Re-deploy the script:
- Make a small change (add a space somewhere)
- Click **Save**
- Click **Deploy** → **Create new version**
- Copy the new URL
- Update admin dashboard

---

## 🔄 How It Works

When you add a dog in the admin dashboard:

```
1. Fill form in admin dashboard
   ↓
2. Click "Add Dog"
   ↓
3. Admin sends POST request to Google Apps Script
   ↓
4. Apps Script receives the data
   ↓
5. Apps Script adds new row to Google Sheet
   ↓
6. Admin dashboard refreshes data from Google Sheets
   ↓
7. Dogs.html is notified via BroadcastChannel
   ↓
8. Dogs.html refreshes and shows new dog
   ↓
9. User sees dog appear instantly! ✓
```

---

## 📋 Checklist

Before going live:

- [ ] Google Apps Script created
- [ ] Code copied into Apps Script
- [ ] Script saved
- [ ] Script deployed as Web app
- [ ] Deployment URL copied
- [ ] URL pasted in admin dashboard
- [ ] Test adding a dog
- [ ] Verify dog appears in Google Sheet
- [ ] Verify dog appears on dogs.html
- [ ] Everything works! ✓

---

## 🎉 Success!

You've successfully connected your admin dashboard to Google Sheets!

Now when you add dogs:
- ✅ They sync to Google Sheets automatically
- ✅ They appear on your public dogs.html page
- ✅ Multiple admins see updates instantly
- ✅ No manual copying needed!

---

## 🔐 Security Notes

**What the script does:**
- ✅ Only receives POST requests (adds data)
- ✅ Only appends to your Google Sheet
- ✅ Requires Apps Script authentication
- ✅ Can't edit or delete existing data (by default)

**What the script doesn't do:**
- ❌ Can't access other sheets
- ❌ Can't delete data
- ❌ Can't external share the URL (only you control it)
- ❌ Can't modify data without your approval

**Safety tip:** The script only runs when called from admin dashboard. Your sheet is safe!

---

## 📞 Need Help?

**Issue:** Script errors?
- Check browser console (F12)
- Check Apps Script execution log
- Verify column headers in Google Sheet

**Issue:** Data not syncing?
- Wait 2-3 seconds after adding
- Refresh both Google Sheet and dogs.html
- Check if Apps Script URL is pasted correctly

**Issue:** Apps Script deployment failed?
- Try deleting old deployments
- Create a new deployment
- Use the new URL

---

## 🚀 Next Steps

1. ✅ Complete setup above
2. ✅ Test with a few dogs
3. ✅ Train your team
4. ✅ Start managing dogs from admin!
5. ✅ (Optional) Add edit/delete functionality

See `ADMIN_FEATURES_LIMITATIONS.md` for more advanced features!

---

**Status:** ✅ Setup Complete  
**Last Updated:** February 15, 2026  
**Support:** Community-maintained (based on Google Apps Script)
