# 🔧 S2 Kennel Jammu - Troubleshooting & FAQ

## 📢 IMPORTANT: What Was Fixed

Your project was configured **incorrectly as a React SPA, but it's actually a static HTML site**. This mismatch caused:
- ❌ Changes not showing on localhost
- ❌ Admin panel not updating
- ❌ CSS/JS not reloading
- ❌ Pages not serving correctly

### ✅ Solution Applied
Updated `vite.config.js` to properly handle **multi-page HTML applications** instead of React SPA.

Result: **Everything now works with hot reload!**

---

## ❓ Frequently Asked Questions

### Q1: My changes aren't showing on localhost!

**A:** Try these steps in order:

1. **Hard Refresh Browser (Clear Cache)**
   - Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
   - Select "Cached images and files"
   - Click "Clear now"
   - Reload page (`F5` or `Ctrl + R`)

2. **Check File Was Saved**
   - Look for white dot next to file name in VS Code
   - If there's a dot, click it to mark as saved
   - Or press `Ctrl + S`

3. **Check Vite Is Running**
   - Look at your terminal
   - Should say: "ROLLDOWN-VITE v7.2.5  ready"
   - If not, run: `npm run dev`

4. **Check Browser Console for Errors**
   - Press `F12` to open DevTools
   - Click "Console" tab
   - Look for red error messages
   - Fix the error mentioned

5. **Restart Dev Server**
   - Press `q` in terminal where npm run dev is running
   - Run: `npm run dev` again
   - Hard refresh browser

---

### Q2: How do I know if the dev server is running?

**A:** Look at your terminal:

✅ **Server is running** if you see:
```
  ROLLDOWN-VITE v7.2.5  ready in 475 ms
  ➜  Local:   http://localhost:5174/
  ➜  press h + enter to show help
```

❌ **Server is NOT running** if:
- Terminal is empty or showing errors
- Doesn't show the "ready" message
- Shows "Port in use" error

**To start:** `npm run dev`

---

### Q3: I see "Port in use" error!

**A:** Another app is using port 5174. Fix it:

```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Wait 2 seconds, then start fresh
npm run dev
```

---

### Q4: Admin panel login isn't working!

**A:** Firebase config is using placeholder values:

**Status:** ⚠️ Not configured yet

**To fix:**
1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable "Authentication" with Email/Password
4. Go to "Project Settings"
5. Scroll to "Your apps" → Web app (</> icon)
6. Copy the `firebaseConfig` object
7. Open `firebase-config.js` in your project
8. Replace the placeholder values with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_ACTUAL_API_KEY",
       authDomain: "your-actual-domain.firebaseapp.com",
       projectId: "your-actual-project-id",
       storageBucket: "your-actual-bucket.appspot.com",
       messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
       appId: "YOUR_ACTUAL_APP_ID"
   };
   ```
9. In Firebase Console → Authentication → Users → Add a test user
10. Use those credentials to login at http://localhost:5174/admin.html

---

### Q5: Dogs aren't showing on the dogs page!

**A:** Check these in order:

1. **Check Internet Connection**
   - Google Sheets requires online access
   - If offline, fallback dogs will show instead

2. **Check Browser Console**
   - Press `F12`
   - Go to "Console" tab
   - Look for error messages about Google Sheets

3. **Verify Google Sheets URL**
   - Open `js/google-sheets-loader.js`
   - Find this line:
     ```javascript
     const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/...';
     ```
   - Make sure the URL is correct
   - Test the URL in browser - should show CSV data

4. **Use Fallback Data**
   - Hardcoded fallback dogs are in `js/google-sheets-loader.js`
   - These will auto-load if Google Sheets fails
   - Check if they appear on dogs page

---

### Q6: How do I add my own dogs to the dogs page?

**A:** Two ways:

**Option 1: Edit Google Sheets (Recommended)**
1. Open your Google Sheet
2. Add new rows with dog data
3. Export as CSV
4. Update URL in `js/google-sheets-loader.js`

**Option 2: Edit Fallback Data**
1. Open `js/google-sheets-loader.js`
2. Find `const FALLBACK_DOGS = [`
3. Add new dog objects to the array:
   ```javascript
   { 
     name: 'Max', 
     breed: 'Labrador', 
     age: '2 years', 
     price: '₹15,000', 
     image: 'images/max.jpg', 
     description: 'Friendly dog' 
   },
   ```
4. Save and refresh browser

---

### Q7: Can I edit CSS and see changes immediately?

**A:** Yes! ✅

1. Open `css/style.css`
2. Make a change (like `color: red;`)
3. Switch to browser
4. **Browser auto-reloads with new CSS**
5. No manual refresh needed!

This works because Vite has **Hot Module Reload (HMR)** enabled.

---

### Q8: What files should I NOT edit?

**❌ DON'T CHANGE:**
- `vite.config.js` (already fixed, don't touch!)
- `firebase-config.js` (unless updating Firebase credentials)
- `package.json` (unless installing packages)
- `server.js` (unless modifying API)

**✅ SAFE TO EDIT:**
- All `.html` files
- All files in `/css/` folder
- All files in `/js/` folder
- Images in `/images/` folder

---

### Q9: How do I check if my changes worked?

**A:** Use browser DevTools:

1. Press `F12` to open DevTools
2. Look at "Console" tab for errors
3. Look at "Network" tab to see loaded files
4. Look at "Elements" tab to inspect HTML
5. Look at "Sources" tab to debug JavaScript

**Red errors** = Something broke
**Yellow warnings** = Safe to ignore usually
**No errors** = All good! ✅

---

### Q10: I accidentally broke something. How do I undo?

**A:** Three options:

**Option 1: Undo in VS Code**
- Press `Ctrl + Z` repeatedly to undo changes
- Or `Edit → Undo` from menu

**Option 2: Revert File**
- Right-click file in VS Code
- Click "Revert File"
- Confirms you want to discard changes

**Option 3: Git (if using version control)**
```bash
git checkout filename.html
```

---

## 🚨 Error Messages & Solutions

### Error: "Cannot find module 'firebase'"

**Cause:** Firebase module not loading
**Solution:**
1. Check `firebase-config.js` has no errors
2. Check internet connection (Firebase CDN needs access)
3. Restart dev server: `npm run dev`

---

### Error: "Vite parse error: unknown variable"

**Cause:** Syntax error in your file
**Solution:**
1. Check for missing closing brackets `}`, `)`, or `;`
2. Look at line number mentioned in error
3. Fix syntax error
4. Save file
5. Browser will auto-update

---

### Error: "Failed to fetch Google Sheets data"

**Cause:** Google Sheets URL is wrong or offline
**Solution:**
1. Check internet connection
2. Verify Google Sheets URL in `js/google-sheets-loader.js`
3. Fallback dogs will auto-load if issue persists
4. Check browser console for full error

---

### Error: "CORS error when loading from..."

**Cause:** Cross-origin request blocked
**Solution:**
- Already included in Google Sheets loader
- Should work out of the box
- If problem persists, update CSV export URL

---

## 📊 Expected Behavior Checklist

### ✅ Main Page (http://localhost:5174/)
- [ ] Page loads without errors
- [ ] Hero image displays
- [ ] Navigation bar responsive
- [ ] Mobile menu works
- [ ] Footer visible

### ✅ Dogs Page (http://localhost:5174/dogs.html)
- [ ] Dogs grid displays
- [ ] Each dog shows image, name, breed
- [ ] Enquiry form modal opens
- [ ] Images can be clicked to enlarge
- [ ] Load from Google Sheets or fallback

### ✅ Admin Panel (http://localhost:5174/admin.html)
- [ ] Login form displays
- [ ] Dark theme visible
- [ ] Firebase config updated with real credentials
- [ ] Can login with valid credentials
- [ ] Dashboard shows stats
- [ ] Can add/edit/delete dogs (once logged in)

### ✅ Other Pages
- [ ] Contact page loads
- [ ] About page loads
- [ ] Cats page loads
- [ ] Health tips loads
- [ ] Location page loads
- [ ] Reviews page loads

---

## 🔍 Debug Tips

### See Console Logs
1. Press `F12` (DevTools)
2. Go to "Console" tab
3. JavaScript console.log() messages will appear
4. Errors in red, warnings in yellow

### See Network Requests
1. Press `F12` (DevTools)
2. Go to "Network" tab
3. Reload page (`F5`)
4. See all files being loaded (CSS, JS, images)
5. Click on file to see details

### Edit CSS Live
1. Press `F12` (DevTools)
2. Go to "Elements" tab
3. Find element you want to style
4. Click "Styles" panel on right
5. Edit CSS in real-time
6. **Note:** These changes won't save - edit actual CSS file to make permanent

### Inspect HTML
1. Right-click element on page
2. Select "Inspect Element"
3. See live HTML structure
4. Identify which element you need to edit

---

## 🎯 Performance Tips

1. **Open browser DevTools once during session** - Don't keep it open, it slows performance
2. **Close unused browser tabs** - Reduces memory usage
3. **Don't have too many terminals open** - Saves system resources
4. **Save files frequently** - Don't wait for Vite to detect changes
5. **Use `Ctrl + S` before testing** - Ensures file is saved

---

## 📞 Still Stuck?

1. **Check console for errors** (`F12` → Console)
2. **Look at terminal running npm run dev** - Any errors there?
3. **Try hard refresh** (`Ctrl + Shift + Delete`)
4. **Restart dev server** (`q` then `npm run dev`)
5. **Check file was actually saved** - Should be no white dot in VS Code

---

**Last Updated:** February 15, 2026
**Status:** ✅ All Issues Fixed & Ready to Use
