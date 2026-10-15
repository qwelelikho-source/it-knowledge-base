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
