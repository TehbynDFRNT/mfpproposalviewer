/**
 * Jitsu analytics client utility
 * Provides functions for tracking events in Jitsu
 */

import { isClient } from './utils';

// Get Jitsu configuration from environment variables
const JITSU_WRITE_KEY = process.env.NEXT_PUBLIC_JITSU_WRITE_KEY || '';

/**
 * Generate a unique message ID for events
 */
function generateMessageId(): string {
  return 'mfp_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Get the current user ID from local storage if available
 */
function getUserId(): string | null {
  if (!isClient()) return null;
  
  const STORAGE_KEY = 'mfp_analytics_user_id';
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Set a user ID in local storage
 */
function setUserId(userId: string): void {
  if (!isClient()) return;
  
  const STORAGE_KEY = 'mfp_analytics_user_id';
  try {
    localStorage.setItem(STORAGE_KEY, userId);
  } catch (e) {
    console.error('Failed to store user ID in localStorage:', e);
  }
}

/**
 * Send an event to Jitsu
 * @param eventName The name of the event
 * @param properties Event properties
 * @param userId Optional user ID for identified users
 */
export async function trackEvent(
  eventName: string,
  properties: Record<string, any>,
  userId?: string
) {
  if (!isClient()) {
    console.warn('trackEvent called server-side, skipping');
    return;
  }
  
  // Get stored user ID if not provided
  const effectiveUserId = userId || getUserId();

  // Get basic context information from browser
  const context = {
    userAgent: navigator.userAgent,
    locale: navigator.language,
    page: {
      url: window.location.href,
      title: document.title,
      path: window.location.pathname,
      referrer: document.referrer,
      host: window.location.hostname,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    },
    library: {
      name: 'mfp-proposal-viewer',
      version: '1.0.0'
    }
  };

  // Create properly formatted Jitsu event
  const eventData = {
    type: "track",
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    messageId: generateMessageId(),
    context,
    ...(effectiveUserId ? { userId: effectiveUserId } : {})
  };

  try {
    const response = await fetch('/api/jitsu-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Failed to send event to Jitsu:', response.status, errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Network error sending event to Jitsu:', error);
    return false;
  }
}

/**
 * Identify a user to Jitsu
 * This should be used when actual user identity is known
 * @param userId The actual user's ID, typically an email or database ID
 * @param traits Optional user traits like name, email, etc.
 */
export async function identify(
  userId: string,
  traits: Record<string, any> = {}
) {
  if (!isClient()) {
    console.warn('identify called server-side, skipping');
    return false;
  }
  
  // Store the userId for future events
  setUserId(userId);
  
  // Get basic context information from browser
  const context = {
    userAgent: navigator.userAgent,
    locale: navigator.language,
    page: {
      url: window.location.href,
      title: document.title,
      path: window.location.pathname,
      referrer: document.referrer,
      host: window.location.hostname,
    },
    library: {
      name: 'mfp-proposal-viewer',
      version: '1.0.0'
    },
    traits
  };

  // Create properly formatted Jitsu identify event
  const eventData = {
    type: "identify",
    userId,
    traits,
    timestamp: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    messageId: generateMessageId(),
    context
  };

  try {
    const response = await fetch('/api/jitsu-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Failed to send identify event to Jitsu:', response.status, errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Network error sending identify event to Jitsu:', error);
    return false;
  }
}

/**
 * Track when a proposal is viewed after successful PIN verification
 * @param customerUuid The customer UUID (proposal ID)
 * @param metadata Additional metadata about the proposal
 * @param userId Optional customer email/identifier for the actual person
 */
export function trackProposalViewed(
  customerUuid: string,
  metadata: Record<string, any> = {},
  userId?: string
) {
  if (!isClient()) return;
  
  // For proposal events, we want to associate with the user if we have them,
  // otherwise just track the event with the proposal context
  return trackEvent('proposal_viewed', {
    proposal_id: customerUuid,
    event_time: new Date().toISOString(),
    ...metadata
  }, userId);
}

/**
 * Track when a proposal is accepted by the customer
 * @param customerUuid The customer UUID (proposal ID)
 * @param metadata Additional metadata about the proposal and acceptance
 * @param userId Optional customer email/identifier for the actual person
 */
export function trackProposalAccepted(
  customerUuid: string,
  metadata: Record<string, any> = {},
  userId?: string
) {
  if (!isClient()) return;
  
  return trackEvent('proposal_accepted', {
    proposal_id: customerUuid,
    event_time: new Date().toISOString(),
    ...metadata
  }, userId);
}

/**
 * Track when a change request is submitted for a proposal
 * @param customerUuid The customer UUID (proposal ID)
 * @param metadata Additional metadata about the change request
 * @param userId Optional customer email/identifier for the actual person
 */
export function trackChangeRequest(
  customerUuid: string,
  metadata: Record<string, any> = {},
  userId?: string
) {
  if (!isClient()) return;
  
  return trackEvent('change_request_submitted', {
    proposal_id: customerUuid,
    event_time: new Date().toISOString(),
    ...metadata
  }, userId);
}

/**
 * Track a button click event
 * @param buttonLabel The button label or identifier
 * @param additionalProps Additional properties to include with the event
 * @param userId Optional user ID for identified users
 */
export function trackButtonClick(
  buttonLabel: string,
  additionalProps: Record<string, any> = {},
  userId?: string
) {
  if (!isClient()) return;
  
  return trackEvent('button_clicked', {
    label: buttonLabel,
    event_time: new Date().toISOString(),
    ...additionalProps
  }, userId);
}

/**
 * Track a page view event
 * @param pagePath The page path (defaults to current path)
 * @param pageTitle The page title (defaults to document title)
 * @param userId Optional user ID for identified users
 */
export function trackPageView(
  pagePath?: string,
  pageTitle?: string,
  userId?: string
) {
  if (!isClient()) return;
  
  return trackEvent('page_viewed', {
    path: pagePath || window.location.pathname,
    title: pageTitle || document.title,
    event_time: new Date().toISOString()
  }, userId);
}