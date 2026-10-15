// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Hash admin password
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
    },
  })
  console.log('Created admin user:', admin.email)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'networking' },
      update: {},
      create: {
        name: 'Networking',
        slug: 'networking',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'hardware' },
      update: {},
      create: {
        name: 'Hardware',
        slug: 'hardware',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'software' },
      update: {},
      create: {
        name: 'Software',
        slug: 'software',
      },
    }),
  ])
  console.log('Created categories:', categories.map(c => c.name))

  // Create guides with steps
  const guides = [
    {
      title: 'Wi-Fi Not Connecting',
      slug: 'wifi-not-connecting',
      summary: 'Troubleshoot and fix common Wi-Fi connection issues on your device.',
      categoryId: categories[0].id,
      published: true,
      steps: [
        { order: 1, title: 'Check Wi-Fi is enabled', body: 'Make sure Wi-Fi is turned on in your device settings. Look for the Wi-Fi icon in your system tray or settings menu.' },
        { order: 2, title: 'Restart your router', body: 'Unplug your router from power, wait 30 seconds, then plug it back in. Wait for all lights to turn green before trying to connect again.' },
        { order: 3, title: 'Forget and reconnect', body: 'Go to your Wi-Fi settings, find your network, and select "Forget" or "Remove this network". Then reconnect by entering your password.' },
        { order: 4, title: 'Check for interference', body: 'Move your device closer to the router. Other electronic devices like microwaves and cordless phones can interfere with Wi-Fi signals.' },
        { order: 5, title: 'Update network drivers', body: 'On Windows, go to Device Manager, find your network adapter, right-click and select "Update driver". On Mac, run Software Update.' },
      ],
    },
    {
      title: 'VPN Connection Issues',
      slug: 'vpn-connection-issues',
      summary: 'Resolve common VPN connection problems and get back to secure browsing.',
      categoryId: categories[0].id,
      published: true,
      steps: [
        { order: 1, title: 'Check your internet connection', body: 'Ensure you have a stable internet connection before trying to connect to VPN. Visit a website to verify connectivity.' },
        { order: 2, title: 'Restart the VPN client', body: 'Close the VPN application completely and reopen it. This can resolve temporary software glitches.' },
        { order: 3, title: 'Try a different server', body: 'Switch to a different VPN server location. Some servers may be overloaded or temporarily unavailable.' },
        { order: 4, title: 'Check firewall settings', body: 'Ensure your firewall or antivirus is not blocking the VPN connection. Add the VPN client to your firewall exceptions.' },
        { order: 5, title: 'Reinstall the VPN client', body: 'Uninstall the VPN software, restart your computer, then download and install the latest version from the provider.' },
      ],
    },
    {
      title: 'Printer Offline',
      slug: 'printer-offline',
      summary: 'Get your printer back online and printing documents smoothly.',
      categoryId: categories[1].id,
      published: true,
      steps: [
        { order: 1, title: 'Check power and connections', body: 'Ensure the printer is powered on and all cables (USB, Ethernet, or power) are securely connected.' },
        { order: 2, title: 'Set as default printer', body: 'Go to your printer settings, right-click on your printer, and select "Set as default printer".' },
        { order: 3, title: 'Clear print queue', body: 'Open the print queue, cancel all pending jobs, and restart the print spooler service if needed.' },
        { order: 4, title: 'Restart printer and computer', body: 'Turn off both the printer and your computer. Wait 30 seconds, then turn on the printer first, then your computer.' },
        { order: 5, title: 'Reinstall printer drivers', body: 'Download the latest drivers from the manufacturer website and install them. This often resolves communication issues.' },
      ],
    },
    {
      title: 'Slow Computer Performance',
      slug: 'slow-computer',
      summary: 'Improve your computer speed and performance with these optimization steps.',
      categoryId: categories[1].id,
      published: true,
      steps: [
        { order: 1, title: 'Restart your computer', body: 'A simple restart can clear temporary files and close background processes that may be slowing down your system.' },
        { order: 2, title: 'Check for malware', body: 'Run a full system scan with your antivirus software to detect and remove any malicious programs.' },
        { order: 3, title: 'Free up disk space', body: 'Delete unnecessary files, empty the recycle bin, and uninstall programs you no longer use. Use Disk Cleanup on Windows.' },
        { order: 4, title: 'Disable startup programs', body: 'Open Task Manager (Ctrl+Shift+Esc), go to the Startup tab, and disable programs that don\'t need to run at startup.' },
        { order: 5, title: 'Update your system', body: 'Install the latest operating system updates and driver updates to ensure optimal performance and security.' },
        { order: 6, title: 'Add more RAM', body: 'If your computer still runs slowly, consider upgrading your RAM. This is one of the most effective hardware upgrades for performance.' },
      ],
    },
    {
      title: 'Password Reset',
      slug: 'password-reset',
      summary: 'Reset your password securely and regain access to your account.',
      categoryId: categories[2].id,
      published: true,
      steps: [
        { order: 1, title: 'Use "Forgot Password" link', body: 'On the login page, click "Forgot Password" or "Reset Password". Enter your email address when prompted.' },
        { order: 2, title: 'Check your email', body: 'Look for a password reset email in your inbox (and spam folder). Click the reset link provided.' },
        { order: 3, title: 'Create a new password', body: 'Enter a strong new password. Use a mix of uppercase, lowercase, numbers, and special characters. Make it at least 12 characters long.' },
        { order: 4, title: 'Update saved passwords', body: 'If you use a password manager, update the saved password for this account. Update it in your browser as well.' },
        { order: 5, title: 'Test the new password', body: 'Log out and log back in with your new password to ensure it works correctly.' },
      ],
    },
    {
      title: 'Outlook Not Syncing',
      slug: 'outlook-not-syncing',
      summary: 'Fix Outlook synchronization issues and get your emails syncing properly.',
      categoryId: categories[2].id,
      published: true,
      steps: [
        { order: 1, title: 'Check internet connection', body: 'Ensure you have a stable internet connection. Outlook needs to be online to sync with the email server.' },
        { order: 2, title: 'Check sync status', body: 'Look at the bottom-right corner of Outlook for a "Working Offline" or "Disconnected" status. Click it to go back online.' },
        { order: 3, title: 'Clear Outlook cache', body: 'Close Outlook, navigate to the Outlook data file location, and delete the OST file. Outlook will recreate it on next launch.' },
        { order: 4, title: 'Repair Outlook profile', body: 'Go to Control Panel > Mail > Show Profiles, select your profile, and click "Repair". Follow the repair wizard instructions.' },
        { order: 5, title: 'Disable add-ins', body: 'Open Outlook in safe mode (hold Ctrl while clicking the Outlook icon). If it works in safe mode, disable add-ins one by one to find the culprit.' },
      ],
    },
    {
      title: 'Reset a Password in Microsoft 365 (Office.com)',
      slug: 'reset-password-microsoft-365',
      summary: 'For IT staff: reset a user\'s Office 365 / Microsoft 365 password from the admin center.',
      categoryId: categories[2].id,
      published: true,
      steps: [
        { order: 1, title: 'Confirm who is asking', body: "Verify the person's identity using your normal process (call-back, manager approval or ID check) before you reset anything." },
        { order: 2, title: 'Open the admin center', body: "Go to **admin.microsoft.com** and sign in with your admin account. You need the Password administrator or Global administrator role. If you cannot see the user list, you do not have the right role." },
        { order: 3, title: 'Find the user', body: "In the left menu go to **Users > Active users**, then select the person who needs the reset." },
        { order: 4, title: 'Reset the password', body: "Click **Reset password**. Choose to auto-generate a password or create one yourself, and tick the option that makes the user **change their password at first sign-in**. Then click **Reset password** to confirm." },
        { order: 5, title: 'Give the temporary password securely', body: "Microsoft no longer emails passwords from the admin center, so pass it on by phone or another secure channel. Never post it in a chat group or a ticket that others can read." },
        { order: 6, title: 'Tell the user what happens next', body: "Ask them to sign in at **office.com** with the temporary password. They will be prompted to choose a new one straight away." },
      ],
    },
    {
      title: 'Reset a Password in Google Workspace (GSuite / Gmail)',
      slug: 'reset-password-google-workspace',
      summary: 'For IT staff: reset a user\'s Google Workspace (GSuite) password from the Google Admin console.',
      categoryId: categories[2].id,
      published: true,
      steps: [
        { order: 1, title: 'Confirm who is asking', body: "Verify the person's identity using your normal process (call-back, manager approval or ID check) before you reset anything." },
        { order: 2, title: 'Open the Admin console', body: "Go to **admin.google.com** and sign in with an admin account that has reset-password privileges." },
        { order: 3, title: 'Find the user', body: "Open the main menu, go to **Directory > Users**, point to the person and click **Reset password**. You can also search for them and open their profile first." },
        { order: 4, title: 'Reset the password', body: "Choose **Automatically generate a password** or **Create password**. Tick **Ask for a password change at the next sign-in**, then click **Reset**." },
        { order: 5, title: 'Reset their sign-in cookies', body: "Open the user's profile, go to **Security**, and reset their sign-in cookies. This signs them out of every active session, which matters most if the account may have been compromised." },
        { order: 6, title: 'Send the user their new password', body: "Google does not send it for you unless you use Email Password. Pass it on by phone or another secure channel." },
        { order: 7, title: 'Check app passwords', body: "A reset revokes the user's app-specific passwords. If they use older mail apps or devices, they may need to create new ones." },
      ],
    },
    {
      title: 'Scan to Email Not Working',
      slug: 'scan-to-email-not-working',
      summary: "Fix a printer or scanner that will not email scans. Covers Microsoft 365 (Office 365) and Google Workspace (GSuite) settings.",
      categoryId: categories[1].id,
      published: true,
      steps: [
        { order: 1, title: 'Read the error and narrow it down', body: "Check the device's screen or job log for an error message or code and write it down. Then find out whether it fails for everyone or one person, and whether other scan options (scan to folder, copy) still work. If only scan to email fails, the problem is almost always the email settings, not the scanner hardware." },
        { order: 2, title: 'Check the basics', body: "Make sure the device is online and can reach the network. Check that its **date and time** are correct, because a wrong clock makes secure email connections fail. Confirm the recipient address is typed correctly, and ask the recipient to check their junk folder." },
        { order: 3, title: 'Check the size of the scan', body: "Very large scans (many pages, colour, high resolution) can be rejected for being too big to email. Try a single page in black and white at a lower resolution. If that works, reduce the quality or scan to a folder or shared drive instead." },
        { order: 4, title: 'Check whether the saved password is still valid', body: "Scan to email often uses one mailbox's username and password stored on the device. If that password was reset or expired, or the account was locked, every scan will fail. Open the device's email (SMTP) settings and re-enter the current credentials." },
        { order: 5, title: 'Microsoft 365: check the sign-in method', body: "Microsoft is switching off basic username-and-password SMTP sign-in for existing tenants, scheduled for the end of December 2026. Devices still using it will fail with an error like: 550 5.7.30 Basic authentication is not supported for Client Submission.\n\nIn the Exchange admin center, run the **SMTP AUTH clients report** to see which devices still use basic authentication. Then move the device to a supported method: OAuth if the device supports it, or an SMTP relay setup for older devices. Check Microsoft's current announcement for the latest dates." },
        { order: 6, title: 'Google Workspace: use the SMTP relay', body: "Google recommends the **SMTP relay service** for printers and scanners. Set the device to use **smtp-relay.gmail.com** on port 25, 465 or 587.\n\nIn the Admin console, go to **Apps > Google Workspace > Gmail > Routing** and check the **SMTP relay service** setting. If it only allows certain IP addresses, make sure your office's public IP address is on the list. A changed IP address after an ISP or router change is a common reason scanning suddenly stops." },
        { order: 7, title: 'Check the port and the firewall', body: "Port 25 is often blocked by firewalls and internet providers. Try port **587** or **465** instead and match the encryption setting (STARTTLS for 587, SSL/TLS for 465). Ask whoever manages the firewall to allow the device through if it is still blocked." },
        { order: 8, title: 'Restart and test again', body: "Restart the device, send a test scan to your own address, and check the message arrives. If it still fails, collect the device model, the exact error message, the time of the failed scan and the settings used (server, port, encryption, sender address) before you escalate." },
      ],
    },
    {
      title: 'Printer Scan Not Working (Scan to Folder or Computer)',
      slug: 'printer-scan-not-working',
      summary: "Fix scan to printer problems: scans that do not reach your computer or a shared folder, or a scanner that is not detected.",
      categoryId: categories[1].id,
      published: true,
      steps: [
        { order: 1, title: 'Check the printer and the paper path', body: "Look at the printer's screen for an error. Make sure the document feeder is not jammed and the scanner lid is closed. Try a **copy**: if copying works, the scanner hardware is fine and the problem is the connection or the scan destination." },
        { order: 2, title: 'Check the network connection', body: "The printer and your computer must be on the same network. Print a **network configuration page** from the printer to see its IP address, then open Command Prompt and run **ping** followed by that address. If there is no reply, reconnect the printer to the network." },
        { order: 3, title: 'Check whether the printer address changed', body: "If the printer gets its address automatically, a new address breaks any saved scan destination. Ask IT to give the printer a **fixed IP address** (a DHCP reservation) so it stops changing." },
        { order: 4, title: 'Scan to folder: check the shared folder', body: "Open the destination folder's sharing settings and check the account the printer uses has permission to write to it. Use the computer's **IP address** in the folder path instead of its name. If that account's password was reset or expired, update it in the printer's scan-to-folder settings." },
        { order: 5, title: 'Scan to folder: check the file sharing version', body: "Newer versions of Windows have the old SMB1 file sharing protocol turned off. Older printers that only support it can no longer connect. Look in the printer's scan settings for an option to use **SMB 2 or 3**, or update the printer's firmware." },
        { order: 6, title: 'Scan to computer: re-add the scanner', body: "On the computer, open **Settings > Bluetooth & devices > Printers & scanners**, remove the printer and add it again. Then reinstall the manufacturer's scanning software or driver and restart the computer." },
        { order: 7, title: 'Check the firewall and security software', body: "A firewall or antivirus program can block scan traffic between the printer and the computer. Temporarily allow the manufacturer's scanning software through the firewall and try again. If it works, ask IT to add a permanent exception." },
        { order: 8, title: 'Restart everything and update firmware', body: "Turn the printer off and on, restart the computer, and try a scan again. Check the manufacturer's website for a firmware update for your printer model. If it still fails, note the printer model, the error message and which scan option fails (folder or computer) when you escalate." },
      ],
    },
  ]

  for (const guideData of guides) {
    const { steps, ...guideInfo } = guideData

    // Safe to re-run: guides that already exist are left alone, so their
    // steps are never duplicated and your edits are never overwritten.
    const existing = await prisma.guide.findUnique({ where: { slug: guideData.slug } })
    if (existing) {
      console.log('Skipped (already exists):', existing.title)
      continue
    }

    const guide = await prisma.guide.create({
      data: { ...guideInfo, steps: { create: steps } },
    })
    console.log(`Created guide: ${guide.title} (${steps.length} steps)`)
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
