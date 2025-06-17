'use client';

import { useRef, useCallback } from 'react';
import { isClient } from '@/lib/utils';
import type { ProposalSnapshot } from '@/types/snapshot';
import { isSectionEmpty } from '@/lib/utils';
import { CATEGORY_IDS } from '@/lib/constants';
import { usePriceCalculator } from '@/hooks/use-price-calculator';

// Analytics event name constants
const EVENTS = {
  IDENTIFY: 'identify',
  PROPOSAL_VIEWED: 'proposal_viewed',
  PROPOSAL_ACCEPTED: 'proposal_accepted',
  CHANGE_REQUEST_SUBMITTED: 'change_request_submitted',
  BUTTON_CLICKED: 'button_clicked',
  SECTION_VIEWED: 'section_viewed'
};

// Event source constants
const SOURCES = {
  PROPOSAL_VIEWER: 'proposal_viewer_mount',
  ACCEPT_DIALOG: 'accept_dialog',
  CHANGE_REQUEST_DIALOG: 'change_request_dialog',
  NAVIGATION: 'section_navigation'
};

/**
 * Generate a unique message ID for events
 */
function generateMessageId(): string {
  return 'mfp_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Send an event directly to the jitsu-event API endpoint
 */
async function sendEvent(eventName: string, properties: Record<string, any>, userId?: string) {
  if (!isClient()) {
    console.warn('sendEvent called server-side, skipping');
    return;
  }
  
  // Create properly formatted event
  const eventData = {
    type: "track",
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    messageId: generateMessageId(),
    context: {
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
    },
    ...(userId ? { userId } : {})
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
      console.error('Failed to send event to analytics API:', response.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Network error sending event to analytics API:', error);
    return false;
  }
}

/**
 * Send an identify event
 */
async function identifyUser(userId: string, traits: Record<string, any> = {}) {
  if (!isClient()) {
    console.warn('identifyUser called server-side, skipping');
    return false;
  }
  
  // Store the userId for future events
  try {
    localStorage.setItem('mfp_analytics_user_id', userId);
  } catch (e) {
    console.error('Failed to store user ID in localStorage:', e);
  }
  
  // Create properly formatted identify event
  const eventData = {
    type: "identify",
    event: EVENTS.IDENTIFY,
    userId,
    traits,
    properties: {
      // Add explicit event_name in properties to ensure it's not default to custom_event
      event_name: EVENTS.IDENTIFY,
      source: 'user_identity'
    },
    timestamp: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    messageId: generateMessageId(),
    context: {
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
    }
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
      console.error('Failed to send identify event:', response.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Network error sending identify event:', error);
    return false;
  }
}

/**
 * Centralized hook to track all proposal analytics events
 * 
 * @param snapshot Proposal snapshot data
 * @returns Object containing tracking functions and status
 */
export function useProposalAnalytics(snapshot: ProposalSnapshot) {
  // Flag to ensure we only track the view once
  const hasTrackedRef = useRef(false);
  
  // Get the pricing breakdown using the price calculator hook
  const { totals } = usePriceCalculator(snapshot);

  // Track the initial proposal view
  const trackView = useCallback(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    
    // Identify the user if email is available
    if (snapshot.email) {
      identifyUser(snapshot.email, {
        name: snapshot.owner1,
        consultant: snapshot.proposal_name,
        phone: snapshot.phone,
        address: snapshot.home_address
      });
    }
    
    // Track the proposal viewed event
    return sendEvent(
      EVENTS.PROPOSAL_VIEWED, 
      {
        proposal_id: snapshot.project_id,
        pin_verified: true,
        customer_name: snapshot.owner1,
        consultant_name: snapshot.proposal_name,
        pool_model: snapshot.spec_name,
        proposal_created_at: snapshot.created_at,
        proposal_last_modified: snapshot.updated_at,
        source: SOURCES.PROPOSAL_VIEWER,
        proposal_status: snapshot.proposal_status,
        event_time: new Date().toISOString()
      },
      snapshot.email
    );
  }, [snapshot]);

  // Handler for tracking proposal acceptance
  const trackAccept = useCallback(() => {
    if (!snapshot.project_id) return;
    
    return sendEvent(
      EVENTS.PROPOSAL_ACCEPTED, 
      {
        proposal_id: snapshot.project_id,
        customer_name: snapshot.owner1,
        consultant_name: snapshot.proposal_name,
        pool_model: snapshot.spec_name,
        total_price: totals.grandTotalCalculated,
        proposal_created_at: snapshot.created_at,
        proposal_last_modified: snapshot.updated_at,
        includes_extras: !isSectionEmpty(CATEGORY_IDS.ADD_ONS, snapshot),
        includes_fencing: !isSectionEmpty(CATEGORY_IDS.FENCING, snapshot),
        includes_water_feature: !isSectionEmpty(CATEGORY_IDS.WATER_FEATURE, snapshot),
        includes_retaining_walls: !isSectionEmpty(CATEGORY_IDS.RETAINING_WALLS, snapshot),
        source: SOURCES.ACCEPT_DIALOG,
        event_time: new Date().toISOString()
      },
      snapshot.email
    );
  }, [snapshot, totals.grandTotalCalculated]);

  // Handler for tracking change requests
  const trackChange = useCallback((sections: string[], customMessage: string) => {
    if (!snapshot.project_id) return;
    
    return sendEvent(
      EVENTS.CHANGE_REQUEST_SUBMITTED,
      {
        proposal_id: snapshot.project_id,
        customer_name: snapshot.owner1,
        consultant_name: snapshot.proposal_name,
        pool_model: snapshot.spec_name,
        proposal_created_at: snapshot.created_at,
        proposal_last_modified: snapshot.updated_at,
        requested_sections: sections.join(','),
        custom_message: customMessage,
        source: SOURCES.CHANGE_REQUEST_DIALOG,
        event_time: new Date().toISOString()
      },
      snapshot.email
    );
  }, [snapshot]);

  // Handler for tracking button clicks
  const trackClick = useCallback((buttonLabel: string, additionalProps: Record<string, any> = {}) => {
    return sendEvent(
      EVENTS.BUTTON_CLICKED, 
      {
        proposal_id: snapshot.project_id,
        label: buttonLabel,
        event_time: new Date().toISOString(),
        ...additionalProps
      },
      snapshot.email
    );
  }, [snapshot]);

  // Handler for tracking section views
  const trackSection = useCallback((sectionId: string, sectionName: string) => {
    if (!snapshot.project_id) return;
    
    return sendEvent(
      EVENTS.SECTION_VIEWED,
      {
        proposal_id: snapshot.project_id,
        section_id: sectionId,
        section_name: sectionName,
        event_time: new Date().toISOString(),
        source: SOURCES.NAVIGATION
      },
      snapshot.email
    );
  }, [snapshot]);

  return {
    hasTracked: hasTrackedRef.current,
    trackView,
    trackAccept,
    trackChange,
    trackClick,
    trackSection
  };
}