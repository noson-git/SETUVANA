/**
 * SETUVANA - Trilingual Internationalization Engine
 * ଓଡ଼ିଆ (Odia) | English | हिन्दी (Hindi)
 */

import { Language } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  brandSub: string;
  
  // Nav & Roles
  navExplore: string;
  navMyBookings: string;
  navHostPortal: string;
  navCoordinatorDesk: string;
  navAdminPanel: string;
  navAIStudio: string;
  navConnectivityMap: string;
  roleTraveller: string;
  roleHost: string;
  roleCoordinator: string;
  roleAdmin: string;
  switchRole: string;

  // Connectivity
  statusOnline: string;
  statusWeak: string;
  statusOffline: string;
  statusSyncing: string;
  statusSynced: string;
  statusPendingSync: string;
  offlineSavedNotice: string;
  lowDataMode: string;
  testLab: string;
  manualSync: string;
  clearCache: string;

  // Search & Filter
  searchTitle: string;
  searchPlaceholder: string;
  filterDistrict: string;
  filterAllDistricts: string;
  filterGuests: string;
  filterCheckIn: string;
  filterCheckOut: string;
  filterMaxPrice: string;
  filterVerifiedOnly: string;
  filterPickupAvailable: string;
  filterCleanWater: string;
  filterReset: string;
  foundHomestays: string;

  // Cards & Details
  perNight: string;
  guestsMax: string;
  viewDetails: string;
  bookNow: string;
  saveOffline: string;
  savedOffline: string;
  verifiedBadge: string;
  coordinatorChecked: string;
  hostDeclared: string;
  bookabilityScore: string;
  roomsAvailable: string;
  amenities: string;
  sanitationWater: string;
  houseRules: string;
  directionsOffline: string;
  communityExperiences: string;
  hostContact: string;
  coordinatorContact: string;
  lastVerified: string;
  shareListing: string;

  // Booking Flow
  bookingTitle: string;
  guestNameLabel: string;
  guestPhoneLabel: string;
  guestEmailLabel: string;
  arrivalEstimatedTime: string;
  selectRoom: string;
  requestPickup: string;
  specialRequests: string;
  submitRequestBtn: string;
  saveDraftOfflineBtn: string;
  totalEstimated: string;
  payAtHomestayNotice: string;
  bookingSuccessTitle: string;
  bookingPendingHost: string;
  bookingConfirmed: string;
  bookingDeclined: string;
  bookingOfflineDraftBadge: string;
  offlineBookingWarning: string;
  downloadArrivalPack: string;
  syncGoogleCalendar: string;
  googleKeepNotes: string;

  // SmartCall
  smartCallTitle: string;
  smartCallDesc: string;
  incomingCallSim: string;
  press1Accept: string;
  press2Decline: string;
  press3Coordinator: string;
  press4Repeat: string;
  smsPreviewTitle: string;
  callAnswered: string;
  callRinging: string;
  callDeclined: string;
  callEscalated: string;

  // Coordinator
  coordinatorDeskTitle: string;
  assignedHosts: string;
  pendingRequests: string;
  unansweredCalls: string;
  callbackQueue: string;
  manualEntryBooking: string;
  dailyRegister: string;
  conflictResolution: string;
  markResolved: string;
  callHostNow: string;

  // Host Portal
  hostPortalTitle: string;
  myListing: string;
  availabilityCalendar: string;
  callLanguagePreference: string;
  registeredPhone: string;
  notificationLog: string;
  simKeypadPhone: string;
  updateInventory: string;
  addNewHomestay: string;

  // Admin & Impact
  adminTitle: string;
  totalListings: string;
  activeBookings: string;
  confirmedStays: string;
  communityRevenue: string;
  exportCsvBtn: string;
  telephonyConfig: string;
  simulationModeLabel: string;
  auditTrail: string;

  // AI & Grounding
  aiAssistantTab: string;
  aiThinkingPlanner: string;
  aiEnhanceStudio: string;
  searchGroundingBadge: string;
  mapsGroundingBadge: string;
  generateVoiceTts: string;
  generateHomestayArt: string;
  editImagePrompt: string;
  thinkingLevelHigh: string;

  // Common
  loading: string;
  close: string;
  cancel: string;
  confirm: string;
  error: string;
  retry: string;
  success: string;
  viewMap: string;

  // Destination Explorer & Nearby Discovery
  exploreOdisha: string;
  exploreOdishaSubtitle: string;
  discoverNearby: string;
  discoverNearbySubtitle: string;
  viewDestination: string;
  demoListingBadge: string;
  demoListingNotice: string;
  exploreStay: string;
  landscapeTypeLabel: string;
  allRegions: string;
}

export const translations: Record<Language, Translations> = {
  or: {
    appName: 'ସେତୁବନ',
    tagline: 'ପ୍ରତ୍ୟେକ ଗ୍ରାମ ସୁଯୋଗ ସହିତ ସଂଯୁକ୍ତ',
    brandSub: 'ଓଡ଼ିଶାର ଜନଜାତି ଓ ଗ୍ରାମୀଣ ହୋମଷ୍ଟେ ପ୍ଲାଟଫର୍ମ - ବିନା ଇଣ୍ଟରନେଟରେ ମଧ୍ୟ କାର୍ଯ୍ୟକ୍ଷମ',
    
    navExplore: 'ଅନୁସନ୍ଧାନ',
    navMyBookings: 'ମୋର ବୁକିଂ',
    navHostPortal: 'ହୋଷ୍ଟ ପୋର୍ଟାଲ',
    navCoordinatorDesk: 'ଗ୍ରାମ ସଂଯୋଜକ ଡେସ୍କ',
    navAdminPanel: 'ପ୍ରଶାସନ ଓ ପ୍ରଭାବ',
    navAIStudio: 'ଏଆଇ ଷ୍ଟୁଡିଓ',
    navConnectivityMap: 'ସଂଯୋଗ ନକ୍ସା',
    roleTraveller: 'ଯାତ୍ରୀ (Traveller)',
    roleHost: 'ହୋଷ୍ଟ (Host)',
    roleCoordinator: 'ଗ୍ରାମ ସଂଯୋଜକ (Coordinator)',
    roleAdmin: 'ପ୍ରଶାସକ (Admin)',
    switchRole: 'ଭୂମିକା ବଦଳାନ୍ତୁ',

    statusOnline: 'ଅନଲାଇନ୍',
    statusWeak: 'ଦୁର୍ବଳ ନେଟୱର୍କ (Low Data)',
    statusOffline: 'ଅଫଲାଇନ୍',
    statusSyncing: 'ସିଙ୍କ ହେଉଛି...',
    statusSynced: 'ସମସ୍ତ ତଥ୍ୟ ସିଙ୍କ ହୋଇଛି',
    statusPendingSync: 'ଅପେକ୍ଷିତ ସିଙ୍କ',
    offlineSavedNotice: 'ଏହି ଡିଭାଇସରେ ସୁରକ୍ଷିତ ଭାବେ ସାଇତା ହୋଇଛି',
    lowDataMode: 'କମ୍ ଡାଟା ମୋଡ୍',
    testLab: 'ସଂଯୋଗ ଟେଷ୍ଟ ଲ୍ୟାବ୍',
    manualSync: 'ବର୍ତ୍ତମାନ ସିଙ୍କ କରନ୍ତୁ',
    clearCache: 'କ୍ୟାସ୍ ସଫା କରନ୍ତୁ',

    searchTitle: 'ଓଡ଼ିଶାର ମନୋରମ ଜନଜାତି ଓ ଗ୍ରାମୀଣ ହୋମଷ୍ଟେ ଖୋଜନ୍ତୁ',
    searchPlaceholder: 'ଗ୍ରାମ କିମ୍ବା ଜିଲ୍ଲା ଖୋଜନ୍ତୁ (ଯଥା: ଦାରିଙ୍ଗବାଡ଼ି, କୋରାପୁଟ, ନିୟମଗିରି...)',
    filterDistrict: 'ଜିଲ୍ଲା',
    filterAllDistricts: 'ସମସ୍ତ ଜିଲ୍ଲା',
    filterGuests: 'ଅତିଥି ସଂଖ୍ୟା',
    filterCheckIn: 'ଆଗମନ ତାରିଖ',
    filterCheckOut: 'ପ୍ରସ୍ଥାନ ତାରିଖ',
    filterMaxPrice: 'ସର୍ବାଧିକ ମୂଲ୍ୟ',
    filterVerifiedOnly: 'ଯାଞ୍ଚ ହୋଇଥିବା ହୋମଷ୍ଟେ',
    filterPickupAvailable: 'ପିକଅପ୍ ସୁବିଧା ଉପଲବ୍ଧ',
    filterCleanWater: 'ବିଶୁଦ୍ଧ ପାନୀୟ ଜଳ ଓ ସ୍ୱଚ୍ଛତା',
    filterReset: 'ଫିଲ୍ଟର ରିସେଟ୍',
    foundHomestays: 'ଟି ହୋମଷ୍ଟେ ମିଳିଲା',

    perNight: '/ ରାତି',
    guestsMax: 'ଜଣ ଅତିଥି',
    viewDetails: 'ସମ୍ପୂର୍ଣ୍ଣ ବିବରଣୀ',
    bookNow: 'ବୁକିଂ ଅନୁରୋଧ ପଠାନ୍ତୁ',
    saveOffline: 'ଅଫଲାଇନ୍ ସାଇତନ୍ତୁ',
    savedOffline: 'ଅଫଲାଇନ୍ ସାଇତା ଯାଇଛି',
    verifiedBadge: 'କ୍ଷେତ୍ର ଯାଞ୍ଚ ସମ୍ପନ୍ନ',
    coordinatorChecked: 'ସଂଯୋଜକଙ୍କ ଦ୍ୱାରା ଯାଞ୍ଚିତ',
    hostDeclared: 'ହୋଷ୍ଟ ଦ୍ୱାରା ଘୋଷିତ',
    bookabilityScore: 'ବୁକେବିଲିଟି ପାସପୋର୍ଟ ସ୍କୋର',
    roomsAvailable: 'ଉପଲବ୍ଧ କୋଠରୀ',
    amenities: 'ସୁବିଧା ସୁଯୋଗ',
    sanitationWater: 'ସ୍ୱଚ୍ଛତା ଓ ବିଶୁଦ୍ଧ ଜଳ',
    houseRules: 'ନିୟମାବଳୀ',
    directionsOffline: 'ଅଫଲାଇନ୍ ଲିଖିତ ରାସ୍ତା ନିର୍ଦ୍ଦେଶନା',
    communityExperiences: 'ଗ୍ରାମୀଣ ଓ ସାଂସ୍କୃତିକ ଅନୁଭୂତି',
    hostContact: 'ହୋଷ୍ଟଙ୍କ ସମ୍ପର୍କ',
    coordinatorContact: 'ସ୍ଥାନୀୟ ସଂଯୋଜକ',
    lastVerified: 'ଶେଷ ଯାଞ୍ଚ ତାରିଖ',
    shareListing: 'ହୋମଷ୍ଟେ ସେୟାର୍ କରନ୍ତୁ',

    bookingTitle: 'ହୋମଷ୍ଟେ ବୁକିଂ ଅନୁରୋଧ',
    guestNameLabel: 'ଆପଣଙ୍କ ନାମ',
    guestPhoneLabel: 'ମୋବାଇଲ୍ ନମ୍ବର',
    guestEmailLabel: 'ଇମେଲ୍ ଠିକଣା',
    arrivalEstimatedTime: 'ଆଗମନ ସମୟ (ଆନୁମାନିକ)',
    selectRoom: 'କୋଠରୀ ବାଛନ୍ତୁ',
    requestPickup: 'ସ୍ଥାନୀୟ ପିକଅପ୍ ଆବଶ୍ୟକ କି?',
    specialRequests: 'ବିଶେଷ ଅନୁରୋଧ (ଖାଦ୍ୟ/ଭାଷା)',
    submitRequestBtn: 'ବୁକିଂ ଅନୁରୋଧ ପଠାନ୍ତୁ',
    saveDraftOfflineBtn: 'ଅଫଲାଇନ୍ ଡ୍ରାଫ୍ଟ ରଖନ୍ତୁ',
    totalEstimated: 'ସମୁଦାୟ ଆନୁମାନିକ ଦେୟ',
    payAtHomestayNotice: 'ହୋମଷ୍ଟେରେ ପହଞ୍ଚିବା ପରେ ସିଧାସଳଖ ହୋଷ୍ଟଙ୍କୁ ଦେୟ ଦିଅନ୍ତୁ',
    bookingSuccessTitle: 'ଅନୁରୋଧ ସଫଳତାର ସହିତ ପଠାଗଲା!',
    bookingPendingHost: 'ହୋଷ୍ଟଙ୍କ ଉତ୍ତରକୁ ଅପେକ୍ଷା କରାଯାଇଛି',
    bookingConfirmed: 'ବୁକିଂ ନିଶ୍ଚିତ ହୋଇଛି (Confirmed)',
    bookingDeclined: 'ଅନୁରୋଧ ପ୍ରତ୍ୟାଖ୍ୟାନ ହୋଇଛି',
    bookingOfflineDraftBadge: 'ଅଫଲାଇନ୍ ଡ୍ରାଫ୍ଟ',
    offlineBookingWarning: 'ଏହି ଅନୁରୋଧ ଡିଭାଇସରେ ସାଇତା ହୋଇଛି, ହୋଷ୍ଟଙ୍କ ନିକଟରେ ପହଞ୍ଚିନାହିଁ। ଇଣ୍ଟରନେଟ୍ ଆସିଲେ ଏହା ସ୍ୱୟଂଚାଳିତ ଭାବେ ପଠାଯିବ।',
    downloadArrivalPack: 'ଅଫଲାଇନ୍ ଆଗମନ ପ୍ୟାକ୍ (Arrival Pack)',
    syncGoogleCalendar: 'ଗୁଗୁଲ କ୍ୟାଲେଣ୍ଡର ସହିତ ଯୋଡ଼ନ୍ତୁ',
    googleKeepNotes: 'ଯାତ୍ରା ଟିପ୍ପଣୀ ଓ ଚେକଲିଷ୍ଟ',

    smartCallTitle: 'ସ୍ମାର୍ଟ-କଲ୍ ସିଷ୍ଟମ୍ (SmartCall AI)',
    smartCallDesc: 'କିପ୍ୟାଡ୍ ଫୋନରେ ସ୍ୱୟଂଚାଳିତ ଓଡ଼ିଆ କଲ୍ ଏବଂ ଏସଏମଏସ ମାଧ୍ୟମରେ ହୋଷ୍ଟ ବୁକିଂ ଗ୍ରହଣ କରନ୍ତି',
    incomingCallSim: 'ହୋଷ୍ଟ ଫୋନରେ ଆସୁଥିବା କଲ୍ (ସିମୁଲେସନ୍)',
    press1Accept: 'ବୁକିଂ ଗ୍ରହଣ କରିବା ପାଇଁ ୧ ଦବାନ୍ତୁ',
    press2Decline: 'ପ୍ରତ୍ୟାଖ୍ୟାନ କରିବା ପାଇଁ ୨ ଦବାନ୍ତୁ',
    press3Coordinator: 'ସଂଯୋଜକ ସହାୟତା ପାଇଁ ୩ ଦବାନ୍ତୁ',
    press4Repeat: 'ପୁନର୍ବାର ଶୁଣିବା ପାଇଁ ୪ ଦବାନ୍ତୁ',
    smsPreviewTitle: 'ହୋଷ୍ଟଙ୍କ ମୋବାଇଲ୍ SMS ବାର୍ତ୍ତା',
    callAnswered: 'କଲ୍ ଗ୍ରହଣ ହେଲା',
    callRinging: 'ଘଣ୍ଟି ବାଜୁଛି...',
    callDeclined: 'କଲ୍ କଟିଗଲା',
    callEscalated: 'ସଂଯୋଜକଙ୍କ ନିକଟକୁ ପଠାଗଲା',

    coordinatorDeskTitle: 'ଗ୍ରାମ ସଂଯୋଜକ କାର୍ଯ୍ୟାଳୟ ଡେସ୍କ',
    assignedHosts: 'ନିଯୁକ୍ତ ହୋମଷ୍ଟେ ହୋଷ୍ଟ',
    pendingRequests: 'ବିଚାରାଧୀନ ବୁକିଂ ଅନୁରୋଧ',
    unansweredCalls: 'ଉତ୍ତର ନମିଳିଥିବା କଲ୍',
    callbackQueue: 'କଲବ୍ୟାକ୍ ଟାସ୍କ ତାଲିକା',
    manualEntryBooking: 'ହାତ ଲେଖା / ଫୋନ୍ ବୁକିଂ ଏଣ୍ଟ୍ରି',
    dailyRegister: 'ଦୈନିକ ଆଗମନ ରେଜିଷ୍ଟର ପ୍ରିଣ୍ଟ',
    conflictResolution: 'ବୁକିଂ ଦ୍ୱନ୍ଦ୍ୱ ସମାଧାନ',
    markResolved: 'ସମାଧାନ ହେଲା ଭାବେ ଚିହ୍ନଟ କରନ୍ତୁ',
    callHostNow: 'ହୋଷ୍ଟଙ୍କୁ ଫୋନ୍ କରନ୍ତୁ',

    hostPortalTitle: 'ହୋମଷ୍ଟେ ହୋଷ୍ଟ ପୋର୍ଟାଲ',
    myListing: 'ମୋର ହୋମଷ୍ଟେ ତଥ୍ୟ',
    availabilityCalendar: 'ଉପଲବ୍ଧତା କ୍ୟାଲେଣ୍ଡର',
    callLanguagePreference: 'କଲ୍ ଏବଂ SMS ଭାଷା ପସନ୍ଦ',
    registeredPhone: 'ପଞ୍ଜୀକୃତ ଫୋନ୍ ନମ୍ବର',
    notificationLog: 'କଲ୍ ଏବଂ SMS ଇତିହାସ',
    simKeypadPhone: 'କିପ୍ୟାଡ୍ ଫୋନ୍ ପରୀକ୍ଷଣ',
    updateInventory: 'କୋଠରୀ ଏବଂ ମୂଲ୍ୟ ପରିବର୍ତ୍ତନ',
    addNewHomestay: 'ନୂଆ ହୋମଷ୍ଟେ ଯୋଡ଼ନ୍ତୁ (AI ସହାୟତା)',

    adminTitle: 'ପ୍ରଶାସନିକ ଡ୍ୟାସବୋର୍ଡ ଏବଂ ସାମାଜିକ ପ୍ରଭାବ',
    totalListings: 'ମୋଟ ହୋମଷ୍ଟେ',
    activeBookings: 'ଚାଲୁଥିବା ବୁକିଂ',
    confirmedStays: 'ସମ୍ପନ୍ନ ଯାତ୍ରା',
    communityRevenue: 'ସମୁଦାୟ ଗ୍ରାମୀଣ ଆୟ (ଟଙ୍କା)',
    exportCsvBtn: 'ରିପୋର୍ଟ CSV ଡାଉନଲୋଡ୍',
    telephonyConfig: 'ଟେଲିଫୋନି ପ୍ରୋଭାଇଡର୍ (Exotel/Simulation)',
    simulationModeLabel: 'ସିମୁଲେସନ୍ ମୋଡ୍ ସକ୍ରିୟ',
    auditTrail: 'ଅଡିଟ୍ ଲଗ୍ ଇତିହାସ',

    aiAssistantTab: 'ଯାତ୍ରା ସହାୟକ ଏଆଇ',
    aiThinkingPlanner: 'ଗଭୀର ଚିନ୍ତନ ଯାତ୍ରା ଯୋଜନା (High Thinking)',
    aiEnhanceStudio: 'ଫଟୋ ଓ ସ୍ୱର ଷ୍ଟୁଡିଓ (Gemini TTS & Images)',
    searchGroundingBadge: 'ଗୁଗୁଲ ସର୍ଚ୍ଚ ସହିତ ପ୍ରମାଣିତ',
    mapsGroundingBadge: 'ଗୁଗୁଲ ମ୍ୟାପ୍ସ ତଥ୍ୟ ସହିତ ସଂଯୁକ୍ତ',
    generateVoiceTts: 'ଓଡ଼ିଆ/ହିନ୍ଦୀ ସ୍ୱର ଉତ୍ପନ୍ନ କରନ୍ତୁ (TTS)',
    generateHomestayArt: 'ହୋମଷ୍ଟେ ଚିତ୍ର ତିଆରି କରନ୍ତୁ (1K/2K/4K)',
    editImagePrompt: 'ଏଡିଟ୍ ଫଟୋ ପ୍ରମ୍ପ୍ଟ (Nano Banana 2.1)',
    thinkingLevelHigh: 'ଉଚ୍ଚ ଚିନ୍ତନ ସ୍ତର (High Reasoning Active)',

    loading: 'ଲୋଡ୍ ହେଉଛି...',
    close: 'ବନ୍ଦ କରନ୍ତୁ',
    cancel: 'ବାତିଲ କରନ୍ତୁ',
    confirm: 'ନିଶ୍ଚିତ କରନ୍ତୁ',
    error: 'ତ୍ରୁଟି ଘଟିଲା',
    retry: 'ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ',
    success: 'କାର୍ଯ୍ୟ ସଫଳ ହେଲା',
    viewMap: 'ନକ୍ସା ଦେଖନ୍ତୁ',

    exploreOdisha: 'ଓଡ଼ିଶା ଅନୁସନ୍ଧାନ',
    exploreOdishaSubtitle: 'ଅନାବୃତ ଜଳପ୍ରପାତ, ପର୍ବତ ଉପତ୍ୟକା, କଫି ବଗିଚା ଓ ପବିତ୍ର ବନାନୀର ମନୋରମ ଭ୍ରମଣ',
    discoverNearby: 'ନିକଟସ୍ଥ ପ୍ରାକୃତିକ ଓ ସାଂସ୍କୃତିକ ଆକର୍ଷଣ',
    discoverNearbySubtitle: 'ଏହି ହୋମଷ୍ଟେ ନିକଟସ୍ଥ ଜଳପ୍ରପାତ, ପାହାଡ଼, ବଣ୍ୟ ଟ୍ରେକ୍ ଓ ହସ୍ତଶିଳ୍ପ ଅନୁଭୂତି',
    viewDestination: 'ଆକର୍ଷଣ ଦେଖନ୍ତୁ',
    demoListingBadge: 'ଡେମୋ ତାଲିକା',
    demoListingNotice: 'OSFIC ମୂଲ୍ୟାଙ୍କନ ଉଦ୍ଦେଶ୍ୟରେ ପ୍ରଦର୍ଶିତ ଉଦାହରଣ ଡେମୋ ତାଲିକା। ପ୍ରକୃତ ହୋଷ୍ଟ ପଞ୍ଜୀକରଣ ଚାଲୁ ରହିଛି।',
    exploreStay: 'ହୋମଷ୍ଟେ ଅନୁସନ୍ଧାନ',
    landscapeTypeLabel: 'ପ୍ରାକୃତିକ ପରିବେଶ',
    allRegions: 'ସମସ୍ତ ଅଞ୍ଚଳ',
  },

  en: {
    appName: 'SETUVANA',
    tagline: 'Every Village Connected to Opportunity',
    brandSub: 'Rural & Tribal Homestays of Odisha - Resilient Offline Booking & AI Connectivity Platform',

    navExplore: 'Explore Homestays',
    navMyBookings: 'My Bookings',
    navHostPortal: 'Host Portal',
    navCoordinatorDesk: 'Coordinator Desk',
    navAdminPanel: 'Admin & Impact',
    navAIStudio: 'AI Studio',
    navConnectivityMap: 'Signal Map',
    roleTraveller: 'Traveller',
    roleHost: 'Host',
    roleCoordinator: 'Village Coordinator',
    roleAdmin: 'Administrator',
    switchRole: 'Switch Role',

    statusOnline: 'Online',
    statusWeak: 'Weak Network (Low Data)',
    statusOffline: 'Offline',
    statusSyncing: 'Synchronizing...',
    statusSynced: 'All Data Synced',
    statusPendingSync: 'Pending Sync',
    offlineSavedNotice: 'Saved locally on this device',
    lowDataMode: 'Low Data Mode',
    testLab: 'Connectivity Test Lab',
    manualSync: 'Sync Now',
    clearCache: 'Clear Cache',

    searchTitle: 'Discover Authentic Tribal & Rural Homestays in Odisha',
    searchPlaceholder: 'Search village, district, or tribe (e.g. Daringbadi, Koraput, Niyamgiri...)',
    filterDistrict: 'District',
    filterAllDistricts: 'All Districts',
    filterGuests: 'Guests',
    filterCheckIn: 'Check-in',
    filterCheckOut: 'Check-out',
    filterMaxPrice: 'Max Price (₹)',
    filterVerifiedOnly: 'Field Verified Only',
    filterPickupAvailable: 'Pickup Available',
    filterCleanWater: 'Clean Water & Sanitation',
    filterReset: 'Reset Filters',
    foundHomestays: 'homestays found',

    perNight: '/ night',
    guestsMax: 'guests max',
    viewDetails: 'View Details',
    bookNow: 'Request Booking',
    saveOffline: 'Save Offline',
    savedOffline: 'Saved Offline',
    verifiedBadge: 'Field Verified',
    coordinatorChecked: 'Coordinator Inspected',
    hostDeclared: 'Host Declared',
    bookabilityScore: 'Bookability Passport',
    roomsAvailable: 'Available Rooms',
    amenities: 'Facilities & Amenities',
    sanitationWater: 'Drinking Water & Sanitation',
    houseRules: 'House Rules',
    directionsOffline: 'Plain-Text Offline Directions',
    communityExperiences: 'Community Experiences',
    hostContact: 'Host Contact',
    coordinatorContact: 'Local Coordinator',
    lastVerified: 'Last Verified Date',
    shareListing: 'Share Listing',

    bookingTitle: 'Homestay Booking Request',
    guestNameLabel: 'Your Full Name',
    guestPhoneLabel: 'Mobile Phone Number',
    guestEmailLabel: 'Email Address',
    arrivalEstimatedTime: 'Estimated Arrival Time',
    selectRoom: 'Select Room Type',
    requestPickup: 'Need pickup from nearest transit point?',
    specialRequests: 'Special Requests (dietary, arrival notes)',
    submitRequestBtn: 'Send Booking Request',
    saveDraftOfflineBtn: 'Save Draft Offline',
    totalEstimated: 'Estimated Total',
    payAtHomestayNotice: 'Pay directly to host in cash or UPI upon arrival. No pre-payment required.',
    bookingSuccessTitle: 'Booking Request Submitted!',
    bookingPendingHost: 'Awaiting Host Response via SmartCall',
    bookingConfirmed: 'Confirmed',
    bookingDeclined: 'Declined by Host',
    bookingOfflineDraftBadge: 'Offline Draft',
    offlineBookingWarning: 'Saved on this device. This request has not yet reached the host. It will automatically submit once internet is restored.',
    downloadArrivalPack: 'Download Offline Arrival Pack',
    syncGoogleCalendar: 'Sync to Google Calendar',
    googleKeepNotes: 'Travel Notes & Checklists',

    smartCallTitle: 'SmartCall Automated Voice & SMS',
    smartCallDesc: 'Connects digital booking requests to hosts on basic keypad phones via voice calls and SMS',
    incomingCallSim: 'Simulated Incoming Host Call',
    press1Accept: 'Press 1 to Accept Request',
    press2Decline: 'Press 2 to Decline Request',
    press3Coordinator: 'Press 3 for Coordinator Assistance',
    press4Repeat: 'Press 4 to Repeat Details',
    smsPreviewTitle: 'Host SMS Message Preview',
    callAnswered: 'Call Answered',
    callRinging: 'Ringing host phone...',
    callDeclined: 'Call Disconnected',
    callEscalated: 'Escalated to Village Coordinator',

    coordinatorDeskTitle: 'Village Coordination Desk',
    assignedHosts: 'Assigned Homestay Hosts',
    pendingRequests: 'Pending Booking Inquiries',
    unansweredCalls: 'Unanswered Notifications',
    callbackQueue: 'Callback Tasks',
    manualEntryBooking: 'Record Manual / Phone Booking',
    dailyRegister: 'Print Daily Arrival Register',
    conflictResolution: 'Booking Conflict Review',
    markResolved: 'Mark Resolved',
    callHostNow: 'Call Host Directly',

    hostPortalTitle: 'Homestay Host Management',
    myListing: 'My Property Listing',
    availabilityCalendar: 'Availability Calendar',
    callLanguagePreference: 'Notification Language Preference',
    registeredPhone: 'Registered Mobile Number',
    notificationLog: 'Call & SMS Delivery History',
    simKeypadPhone: 'Keypad Phone Simulator',
    updateInventory: 'Update Room Rates & Capacity',
    addNewHomestay: 'Add New Homestay (AI Guided)',

    adminTitle: 'Administration & Rural Impact Dashboard',
    totalListings: 'Total Registered Homestays',
    activeBookings: 'Active Bookings',
    confirmedStays: 'Completed Stays',
    communityRevenue: 'Host-Reported Revenue (₹)',
    exportCsvBtn: 'Export Reports (CSV)',
    telephonyConfig: 'Telephony Provider Settings',
    simulationModeLabel: 'Simulation Mode Active',
    auditTrail: 'System Audit Trail',

    aiAssistantTab: 'Travel Companion AI',
    aiThinkingPlanner: 'Deep Reasoning Route Planner (High Thinking)',
    aiEnhanceStudio: 'Visual & Voice Studio (Gemini TTS & Images)',
    searchGroundingBadge: 'Grounded with Google Search',
    mapsGroundingBadge: 'Grounded with Google Maps',
    generateVoiceTts: 'Generate Spoken Audio (TTS)',
    generateHomestayArt: 'Generate High-Quality Homestay Art (1K/2K/4K)',
    editImagePrompt: 'Edit Image Prompt (Nano Banana 2.1)',
    thinkingLevelHigh: 'Thinking Level: High (Gemini 4 Argon)',

    loading: 'Loading...',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    error: 'Error',
    retry: 'Retry',
    success: 'Success',
    viewMap: 'View Map',

    exploreOdisha: 'Explore Odisha',
    exploreOdishaSubtitle: 'Discover untamed waterfalls, mountain valleys, coffee gardens & sacred biosphere groves',
    discoverNearby: 'Discover Nearby Attractions',
    discoverNearbySubtitle: 'Explore nature trails, waterfalls, and cultural experiences around this village homestay',
    viewDestination: 'View Attraction',
    demoListingBadge: 'Demo Listing',
    demoListingNotice: 'Illustrative demonstration listing for OSFIC evaluation. Actual verified host onboarding active.',
    exploreStay: 'Explore Stay',
    landscapeTypeLabel: 'Landscape',
    allRegions: 'All Regions',
  },

  hi: {
    appName: 'सेतुवन',
    tagline: 'हर गाँव अवसर से जुड़ा',
    brandSub: 'ओडिशा के ग्रामीण और जनजातीय होमस्टे - ऑफ़लाइन-प्रथम बुकिंग और एआई कनेक्टिविटी प्लेटफॉर्म',

    navExplore: 'होमस्टे खोजें',
    navMyBookings: 'मेरी बुकिंग्स',
    navHostPortal: 'मेजबान पोर्टल',
    navCoordinatorDesk: 'ग्राम समन्वयक डेस्क',
    navAdminPanel: 'प्रशासन एवं प्रभाव',
    navAIStudio: 'एआई स्टूडियो',
    navConnectivityMap: 'सिग्नल मैप',
    roleTraveller: 'यात्री (Traveller)',
    roleHost: 'मेजबान (Host)',
    roleCoordinator: 'ग्राम समन्वयक (Coordinator)',
    roleAdmin: 'प्रशासक (Admin)',
    switchRole: 'भूमिका बदलें',

    statusOnline: 'ऑनलाइन',
    statusWeak: 'कमजोर नेटवर्क (Low Data)',
    statusOffline: 'ऑफ़लाइन',
    statusSyncing: 'सिंक हो रहा है...',
    statusSynced: 'सभी डेटा सिंक है',
    statusPendingSync: 'लंबित सिंक',
    offlineSavedNotice: 'इस डिवाइस पर सुरक्षित सहेजा गया',
    lowDataMode: 'कम डेटा मोड',
    testLab: 'कनेक्टिविटी टेस्ट लैब',
    manualSync: 'अभी सिंक करें',
    clearCache: 'कैश साफ़ करें',

    searchTitle: 'ओडिशा के प्रामाणिक जनजातीय और ग्रामीण होमस्टे खोजें',
    searchPlaceholder: 'गाँव, जिला या जनजाति खोजें (उदा: दारिंगबाड़ी, कोरापुट, नियमगिरि...)',
    filterDistrict: 'जिला',
    filterAllDistricts: 'सभी जिले',
    filterGuests: 'अतिथि',
    filterCheckIn: 'आगमन तारीख',
    filterCheckOut: 'प्रस्थान तारीख',
    filterMaxPrice: 'अधिकतम मूल्य (₹)',
    filterVerifiedOnly: 'सत्यापित होमस्टे',
    filterPickupAvailable: 'पिकअप उपलब्ध',
    filterCleanWater: 'स्वच्छ पानी और स्वच्छता',
    filterReset: 'फ़िल्टर रीसेट करें',
    foundHomestays: 'होमस्टे मिले',

    perNight: '/ रात',
    guestsMax: 'अधिकतम अतिथि',
    viewDetails: 'विवरण देखें',
    bookNow: 'बुकिंग अनुरोध भेजें',
    saveOffline: 'ऑफ़लाइन सहेजें',
    savedOffline: 'ऑफ़लाइन सहेजा गया',
    verifiedBadge: 'फील्ड सत्यापित',
    coordinatorChecked: 'समन्वयक द्वारा जांचा गया',
    hostDeclared: 'मेजबान द्वारा घोषित',
    bookabilityScore: 'बुकेबिलिटी पासपोर्ट स्कोर',
    roomsAvailable: 'उपलब्ध कमरे',
    amenities: 'सुविधाएं',
    sanitationWater: 'पेयजल और स्वच्छता',
    houseRules: 'नियम',
    directionsOffline: 'ऑफ़लाइन लिखित दिशा-निर्देश',
    communityExperiences: 'सामुदायिक अनुभव',
    hostContact: 'मेजबान संपर्क',
    coordinatorContact: 'स्थानीय समन्वयक',
    lastVerified: 'अंतिम सत्यापन तारीख',
    shareListing: 'होमस्टे साझा करें',

    bookingTitle: 'होमस्टे बुकिंग अनुरोध',
    guestNameLabel: 'आपका पूरा नाम',
    guestPhoneLabel: 'मोबाइल नंबर',
    guestEmailLabel: 'ईमेल पता',
    arrivalEstimatedTime: 'अनुमानित आगमन समय',
    selectRoom: 'कमरे का प्रकार चुनें',
    requestPickup: 'क्या नजदीकी स्टेशन से पिकअप चाहिए?',
    specialRequests: 'विशेष अनुरोध (खान-पान / भाषा)',
    submitRequestBtn: 'बुकिंग अनुरोध भेजें',
    saveDraftOfflineBtn: 'ऑफ़लाइन ड्राफ्ट रखें',
    totalEstimated: 'अनुमानित कुल राशि',
    payAtHomestayNotice: 'आगमन पर सीधे मेजबान को नकद या यूपीआई द्वारा भुगतान करें।',
    bookingSuccessTitle: 'अनुरोध सफलतापूर्वक भेजा गया!',
    bookingPendingHost: 'स्मार्ट-कॉल द्वारा मेजबान की प्रतिक्रिया की प्रतीक्षा है',
    bookingConfirmed: 'पुष्टि की गई (Confirmed)',
    bookingDeclined: 'मेजबान द्वारा अस्वीकृत',
    bookingOfflineDraftBadge: 'ऑफ़लाइन ड्राफ्ट',
    offlineBookingWarning: 'इस डिवाइस पर सहेजा गया है। यह अनुरोध अभी तक मेजबान तक नहीं पहुँचा है। इंटरनेट आते ही यह स्वतः भेजा जाएगा।',
    downloadArrivalPack: 'ऑफ़लाइन अराइवल पैक डाउनलोड करें',
    syncGoogleCalendar: 'गूगल कैलेंडर से जोड़ें',
    googleKeepNotes: 'यात्रा नोट्स एवं चेकलिस्ट',

    smartCallTitle: 'स्मार्ट-कॉल स्वचालित वॉइस और एसएमएस',
    smartCallDesc: 'साधारण कीपैड फोन पर स्वचालित कॉल और एसएमएस द्वारा मेजबान को जोड़ता है',
    incomingCallSim: 'मेजबान फोन पर इनकमिंग कॉल (सिमुलेशन)',
    press1Accept: 'बुकिंग स्वीकार करने के लिए 1 दबाएं',
    press2Decline: 'अस्वीकार करने के लिए 2 दबाएं',
    press3Coordinator: 'समन्वयक सहायता के लिए 3 दबाएं',
    press4Repeat: 'विवरण दोबारा सुनने के लिए 4 दबाएं',
    smsPreviewTitle: 'मेजबान एसएमएस पूर्वावलोकन',
    callAnswered: 'कॉल उठाया गया',
    callRinging: 'घंटी बज रही है...',
    callDeclined: 'कॉल काटा गया',
    callEscalated: 'ग्राम समन्वयक को भेजा गया',

    coordinatorDeskTitle: 'ग्राम समन्वय डेस्क',
    assignedHosts: 'आवंटित होमस्टे मेजबान',
    pendingRequests: 'लंबित बुकिंग अनुरोध',
    unansweredCalls: 'अनुत्तरित कॉल्स',
    callbackQueue: 'कॉलबैक कार्य सूची',
    manualEntryBooking: 'मौखिक / फोन बुकिंग दर्ज करें',
    dailyRegister: 'दैनिक आगमन रजिस्टर प्रिंट करें',
    conflictResolution: 'बुकिंग टकराव समाधान',
    markResolved: 'समाधान हुआ चिह्नित करें',
    callHostNow: 'सीधे मेजबान को कॉल करें',

    hostPortalTitle: 'होमस्टे मेजबान प्रबंधन',
    myListing: 'मेरी संपत्ति सूची',
    availabilityCalendar: 'उपलब्धता कैलेंडर',
    callLanguagePreference: 'कॉल और एसएमएस भाषा वरीयता',
    registeredPhone: 'पंजीकृत मोबाइल नंबर',
    notificationLog: 'कॉल और एसएमएस इतिहास',
    simKeypadPhone: 'कीपैड फोन सिम्युलेटर',
    updateInventory: 'कमरे और दरें अपडेट करें',
    addNewHomestay: 'नया होमस्टे जोड़ें (एआई सहायता)',

    adminTitle: 'प्रशासनिक डैशबोर्ड एवं सामाजिक प्रभाव',
    totalListings: 'कुल पंजीकृत होमस्टे',
    activeBookings: 'सक्रिय बुकिंग्स',
    confirmedStays: 'सफल यात्राएं',
    communityRevenue: 'ग्रामीण सामुदायिक आय (₹)',
    exportCsvBtn: 'रिपोर्ट्स CSV डाउनलोड करें',
    telephonyConfig: 'टेलीफोनी प्रदाता सेटिंग्स',
    simulationModeLabel: 'सिमुलेशन मोड सक्रिय',
    auditTrail: 'सिस्टम ऑडिट ट्रेल',

    aiAssistantTab: 'यात्रा साथी एआई',
    aiThinkingPlanner: 'गहन विचार यात्रा योजना (High Thinking)',
    aiEnhanceStudio: 'दृश्य एवं स्वर स्टूडियो (Gemini TTS & Images)',
    searchGroundingBadge: 'गूगल सर्च द्वारा प्रमाणित',
    mapsGroundingBadge: 'गूगल मैप्स डेटा से जुड़ा',
    generateVoiceTts: 'आवाज़ उत्पन्न करें (TTS)',
    generateHomestayArt: 'उच्च-गुणवत्ता होमस्टे कला बनाएं (1K/2K/4K)',
    editImagePrompt: 'छवि संपादन प्रॉम्प्ट (Nano Banana 2.1)',
    thinkingLevelHigh: 'उच्च चिंतन स्तर (Gemini 4 Argon)',

    loading: 'लोड हो रहा है...',
    close: 'बंद करें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    error: 'त्रुटि',
    retry: 'पुनः प्रयास करें',
    success: 'सफल',
    viewMap: 'नक्शा देखें',

    exploreOdisha: 'ओडिशा अन्वेषण',
    exploreOdishaSubtitle: 'अनछुए जलप्रपात, पर्वत घाटियां, कॉफी बगान और पवित्र जैवमंडल अभयारण्य खोजें',
    discoverNearby: 'आसपास के प्रमुख आकर्षण',
    discoverNearbySubtitle: 'इस होमस्टे के पास के झरने, पहाड़ियां और सांस्कृतिक अनुभव देखें',
    viewDestination: 'आकर्षण देखें',
    demoListingBadge: 'डेमो लिस्टिंग',
    demoListingNotice: 'OSFIC मूल्यांकन हेतु उदाहरणात्मक डेमो लिस्टिंग। वास्तविक मेजबान ऑनबोर्डिंग जारी है।',
    exploreStay: 'होमस्टे देखें',
    landscapeTypeLabel: 'प्राकृतिक परिदृश्य',
    allRegions: 'सभी क्षेत्र',
  },
};
