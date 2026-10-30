/**
 * SETUVANA - Core Domain Models & Types
 * Odisha Rural & Tribal Homestay Booking & Connectivity Platform
 */

export type Language = 'or' | 'en' | 'hi';

export type UserRole = 'traveller' | 'host' | 'coordinator' | 'admin';

export type ConnectivityMode = 'good' | 'weak' | 'offline';

export type SyncStatus = 
  | 'saved_locally' 
  | 'waiting' 
  | 'syncing' 
  | 'synced' 
  | 'conflict' 
  | 'failed';

export type BookingStatus =
  | 'draft'
  | 'saved_offline'
  | 'pending_sync'
  | 'request_submitted'
  | 'awaiting_host_response'
  | 'confirmed'
  | 'declined'
  | 'conflict_review'
  | 'cancellation_requested'
  | 'cancelled'
  | 'checked_in'
  | 'completed'
  | 'no_show'
  | 'expired';

export interface Room {
  id: string;
  name: string;
  type: 'Traditional Mud & Bamboo Cottage' | 'Stone & Thatched Hut' | 'Veranda Room' | 'Wooden Eco-Cabin';
  capacity: number;
  pricePerNight: number;
  beds: string;
  privateBath: boolean;
}

export interface CommunityExperience {
  id: string;
  title: string;
  odiaTitle: string;
  description: string;
  providerName: string;
  price: number;
  duration: string;
  category: 'craft' | 'food' | 'nature' | 'dance' | 'farming';
}

export interface Homestay {
  id: string;
  name: string;
  odiaName: string;
  hindiName: string;
  district: 'Kandhamal' | 'Koraput' | 'Rayagada' | 'Mayurbhanj' | 'Bargarh' | 'Puri' | 'Sundargarh';
  village: string;
  block: string;
  tribalCommunity: 'Dongria Kondh' | 'Kutia Kondh' | 'Desia' | 'Santhal' | 'Saura' | 'Sambalpuri Rural';
  hostId: string;
  hostName: string;
  hostPhone: string;
  coordinatorId: string;
  coordinatorName: string;
  coordinatorPhone: string;
  pricePerNight: number;
  capacityGuests: number;
  roomsCount: number;
  rooms: Room[];
  facilities: string[];
  sanitationInfo: string;
  drinkingWaterInfo: string;
  familySuitability: boolean;
  accessibility: string;
  pickupAvailable: boolean;
  pickupDetails: string;
  landmarkDirections: string;
  plainTextDirections: string;
  gpsCoordinates: { lat: number; lng: number };
  images: string[];
  description: string;
  odiaDescription: string;
  hindiDescription: string;
  verificationStatus: 'verified_field_visit' | 'coordinator_inspected' | 'host_self_declared' | 'requires_reconfirmation';
  bookabilityScore: number;
  lastVerifiedDate: string;
  houseRules: string[];
  mealsAvailable: string[];
  communityExperiences: CommunityExperience[];
  landscapeType?: 'Misty Hills & Coffee' | 'Mountain Peaks & Terraces' | 'Village Courtyard & Millet Fields' | 'Dense Sal Forest' | 'Cultivated Valleys' | 'Wetlands & Coastal Lagoon';
  isDemoListing?: boolean;
  nearbyAttractionIds?: string[];
  rating: number;
  reviewCount: number;
}

export interface DestinationAttraction {
  id: string;
  name: string;
  odiaName: string;
  hindiName: string;
  region: 'Daringbadi and Kandhamal' | 'Koraput and Deomali' | 'Phulbani' | 'Mayurbhanj and Baripada';
  district: 'Kandhamal' | 'Koraput' | 'Rayagada' | 'Mayurbhanj' | 'Bargarh' | 'Puri';
  category: 'waterfall' | 'viewpoint' | 'forest' | 'heritage' | 'coffee_garden' | 'craft';
  description: string;
  odiaDescription: string;
  image: string;
  activities: string[];
  bestSeason: string;
  approxDistanceNote: string;
}

export interface SmartCallNotification {
  id: string;
  bookingId: string;
  bookingReference: string;
  hostId: string;
  hostPhone: string;
  preferredLanguage: Language;
  channel: 'voice_call' | 'sms';
  provider: 'exotel' | 'simulation';
  status: 'queued' | 'submitted' | 'ringing' | 'answered' | 'dtmf_received' | 'completed' | 'no_answer' | 'failed' | 'escalated';
  dtmfInput?: '1' | '2' | '3' | '4';
  dtmfAction?: 'accept' | 'decline' | 'escalate_coordinator' | 'repeat';
  voiceScript: string;
  smsText: string;
  attempts: number;
  createdAt: string;
  lastAttemptAt: string;
  error?: string;
}

export interface Booking {
  id: string;
  reference: string;
  propertyId: string;
  propertyName: string;
  propertyVillage: string;
  propertyDistrict: string;
  roomId: string;
  roomName: string;
  hostId: string;
  hostName: string;
  hostPhone: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  estimatedArrivalTime: string;
  guestsCount: number;
  totalAmount: number;
  paymentMode: 'pay_at_homestay' | 'coordinator_assisted' | 'online_pending';
  status: BookingStatus;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
  notificationHistory: SmartCallNotification[];
  idempotencyKey: string;
  specialRequests?: string;
  pickupRequested?: boolean;
  selectedExperienceIds?: string[];
  notes?: string;
  calendarEventId?: string;
}

export interface CoordinatorTask {
  id: string;
  coordinatorId: string;
  bookingId?: string;
  homestayId: string;
  homestayName: string;
  hostName: string;
  hostPhone: string;
  taskType: 'unanswered_call_followup' | 'arrival_pickup' | 'conflict_resolution' | 'host_onboarding' | 'in_person_booking';
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'normal';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  resolvedAt?: string;
}

export interface BookabilityPassport {
  homestayId: string;
  listingCompleteness: number;
  hostIdentityVerified: boolean;
  contactPhoneChecked: boolean;
  coordinatorFieldInspected: boolean;
  physicalAmenitiesConfirmed: boolean;
  cleanWaterSanitationVerified: boolean;
  emergencyContactActive: boolean;
  lastContactAttemptDate: string;
  lastInspectedBy: string;
  openIssuesCount: number;
  notes: string[];
}

export interface ConnectivityObservation {
  id: string;
  district: string;
  village: string;
  latitude: number;
  longitude: number;
  operator: 'Jio' | 'Airtel' | 'BSNL' | 'Vi';
  voiceAvailable: boolean;
  smsAvailable: boolean;
  dataQuality: 'none' | '2g_edge' | '4g_weak' | '4g_good';
  reportedAt: string;
  reporterRole: string;
}

export interface Review {
  id: string;
  homestayId: string;
  bookingReference: string;
  guestName: string;
  rating: number;
  comment: string;
  stayDate: string;
  verifiedStay: boolean;
  hostResponse?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: UserRole;
  actorName: string;
  action: string;
  details: string;
}

export interface OfflineActionQueueItem {
  id: string;
  actionType: 'create_booking' | 'update_homestay' | 'coordinator_action' | 'report_connectivity';
  payload: any;
  createdAt: string;
  attempts: number;
  lastError?: string;
  /**
   * Links a queued action back to the locally-saved draft Booking it belongs to,
   * so the draft's status can be advanced once the server acknowledges it.
   */
  localBookingId?: string;
}
