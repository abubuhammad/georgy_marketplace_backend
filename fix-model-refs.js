const fs = require('fs');
const path = require('path');

// Model rename mappings based on actual Prisma schema
const modelRenameMappings = {
  'prisma.trustProfile': 'prisma.userTrustProfile',
  'prisma.privacySettings': 'prisma.userPrivacySettings',
  'prisma.notification': 'prisma.notification',
  'prisma.notificationPreference': 'prisma.notificationPreference',
  'prisma.userNotificationPreference': 'prisma.userNotificationPreference',
  'prisma.chatMessage': 'prisma.chatMessage',
  'prisma.verificationBadge': 'prisma.verificationBadge',
  'prisma.endorsement': 'prisma.endorsement',
  'prisma.socialConnection': 'prisma.socialConnection',
  'prisma.communityPost': 'prisma.communityPost',
  'prisma.reviewAuthenticity': 'prisma.reviewAuthenticity',
  'prisma.securityFinding': 'prisma.securityFinding',
  'prisma.vulnerabilityAssessment': 'prisma.vulnerabilityAssessment',
  'prisma.securityLog': 'prisma.securityLog',
  'prisma.blockedIP': 'prisma.blockedIP',
  'prisma.securityScan': 'prisma.securityScan',
  'prisma.userActivity': 'prisma.userActivity',
  'prisma.emergencyContact': 'prisma.emergencyContact',
  'prisma.safetySettings': 'prisma.safetySettings',
  'prisma.meetingGuidelines': 'prisma.meetingGuidelines',
  'prisma.trustMetric': 'prisma.trustMetric',
  'prisma.policyViolation': 'prisma.policyViolation',
  'prisma.riskAssessment': 'prisma.riskAssessment',
  'prisma.reputationChange': 'prisma.reputationChange',
  'prisma.identityVerification': 'prisma.identityVerification',
  'prisma.backgroundCheck': 'prisma.backgroundCheck',
  'prisma.dataExportRequest': 'prisma.dataExportRequest',
  'prisma.dataDeletionRequest': 'prisma.dataDeletionRequest',
  'prisma.consentRecord': 'prisma.consentRecord'
};

// Field rename mappings
const fieldRenameMappings = {
  'requestDate:': 'requestedAt:',
  'withdrawalDate:': 'withdrawnAt:',
  'expiryDate:': 'expiresAt:',
  'timestamp:': 'createdAt:',
  'suspendedAt:': 'isSuspended:',
  'deletedAt:': 'isDeleted:',
  'lastUpdated:': 'updatedAt:',
  'verifiedAt:': 'earnedAt:',
  'results:': 'result:',
  'requestedAt:': 'requestedBy:', // for BackgroundCheck
  'targetUrl:': 'target:',
  'endorsedUserId:': 'endorseeId:',
  'sellerId:': 'productId:', // for Review queries
  'order:': '', // Remove non-existent include
  'profile:': '', // Remove non-existent include
  'reportsReceived:': 'reportsReceived:', // Keep as is
  'events:': '', // Remove non-existent include
  'shipments:': 'shipments:', // Keep as is
  'findings:': 'securityFindings:', // Fix include name
  'agent:': 'agent:', // Keep as is but fix access
  'blocked:': 'flagged:', // Fix field name
  'vulnerabilitiesFound:': 'findings:',
  'conductedAt:': 'completedAt:',
  'lastScanned:': '',
  'submittedAt:': 'createdAt:',
  'reviewedAt:': 'verifiedAt:',
  'sendMultiChannelNotification': 'sendNotification',
  'roomId': 'chatId'
};

function fixFileReferences(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Apply model renames
    for (const [oldRef, newRef] of Object.entries(modelRenameMappings)) {
      if (content.includes(oldRef)) {
        content = content.split(oldRef).join(newRef);
        changed = true;
      }
    }

    // Apply field renames
    for (const [oldField, newField] of Object.entries(fieldRenameMappings)) {
      if (content.includes(oldField)) {
        content = content.split(oldField).join(newField);
        changed = true;
      }
    }

    // Save if changed
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function getAllServiceFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllServiceFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
const servicesDir = path.join(__dirname, 'src', 'services');
const serviceFiles = getAllServiceFiles(servicesDir);

console.log(`🔧 Fixing ${serviceFiles.length} service files...`);

let fixedCount = 0;
for (const file of serviceFiles) {
  if (fixFileReferences(file)) {
    fixedCount++;
  }
}

console.log(`🎉 Fixed ${fixedCount} files with model/field reference issues`);
console.log('📝 Run "npx tsc --noEmit" to check remaining errors');
