const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', '..', '.cursor', 'projects', 'c-Users-Desktop-LMS', 'assets', 'c__Users________AppData_Roaming_Cursor_User_workspaceStorage_d8534d9bd38f428d215f3e84ff1078a1_images_schoolboy-79ac6c5c-00ec-4680-813e-5ca7a5e46c66.png');
const dest = path.join(__dirname, 'public/images/roles/schoolboy.jpg');

try {
  fs.copyFileSync(src, dest);
  console.log('OK: schoolboy.jpg copied');
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
