/* Custom outline icon set (1.5px stroke) — BusTrack BO */
const Icon = ({ d, size = 18, stroke = 1.6, children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children || (d && <path d={d} />)}
  </svg>
);

const I = {
  Dashboard: (p) => (<Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></Icon>),
  Ticket: (p) => (<Icon {...p}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4z"/><path d="M14 7v10" strokeDasharray="2 2"/></Icon>),
  Route: (p) => (<Icon {...p}><circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v4a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4"/></Icon>),
  Bus: (p) => (<Icon {...p}><rect x="3" y="5" width="18" height="13" rx="2.5"/><path d="M3 11h18"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/><path d="M7 8h2M15 8h2"/></Icon>),
  Driver: (p) => (<Icon {...p}><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/></Icon>),
  Pricing: (p) => (<Icon {...p}><path d="M20 12 12 4H4v8l8 8z"/><circle cx="8.5" cy="8.5" r="1.2"/></Icon>),
  Reports: (p) => (<Icon {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 16V11M12 16V8M16 16v-3"/></Icon>),
  Settings: (p) => (<Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>),
  Search: (p) => (<Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>),
  Bell: (p) => (<Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></Icon>),
  ChevronDown: (p) => (<Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>),
  ChevronRight: (p) => (<Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>),
  ChevronLeft: (p) => (<Icon {...p}><path d="m15 6-6 6 6 6"/></Icon>),
  ArrowUp: (p) => (<Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>),
  ArrowDown: (p) => (<Icon {...p}><path d="M12 5v14M19 12l-7 7-7-7"/></Icon>),
  ArrowRight: (p) => (<Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>),
  Plus: (p) => (<Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>),
  More: (p) => (<Icon {...p}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></Icon>),
  Eye: (p) => (<Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></Icon>),
  Edit: (p) => (<Icon {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></Icon>),
  Trash: (p) => (<Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></Icon>),
  Power: (p) => (<Icon {...p}><path d="M12 2v10"/><path d="M5.5 7a8 8 0 1 0 13 0"/></Icon>),
  Calendar: (p) => (<Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Icon>),
  MapPin: (p) => (<Icon {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></Icon>),
  Clock: (p) => (<Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>),
  Money: (p) => (<Icon {...p}><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v4M18 10v4"/></Icon>),
  Users: (p) => (<Icon {...p}><circle cx="9" cy="8" r="3"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.7 0 4 1.7 4 4"/></Icon>),
  Steering: (p) => (<Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 9.5V3M14.5 12H21M9.5 12H3M12 14.5V21"/></Icon>),
  Logout: (p) => (<Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></Icon>),
  Check: (p) => (<Icon {...p}><path d="m5 12 5 5L20 7"/></Icon>),
  Close: (p) => (<Icon {...p}><path d="M6 6l12 12M18 6 6 18"/></Icon>),
  Download: (p) => (<Icon {...p}><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></Icon>),
  Filter: (p) => (<Icon {...p}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></Icon>),
  Sort: (p) => (<Icon {...p}><path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4"/></Icon>),
  Fuel: (p) => (<Icon {...p}><rect x="3" y="3" width="11" height="18" rx="1.5"/><path d="M3 11h11"/><path d="M14 8h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V8l-2-3"/></Icon>),
  Wifi: (p) => (<Icon {...p}><path d="M2 9a16 16 0 0 1 20 0"/><path d="M5 13a11 11 0 0 1 14 0"/><path d="M8.5 16.5a6 6 0 0 1 7 0"/><circle cx="12" cy="20" r="0.8" fill="currentColor"/></Icon>),
  Snow: (p) => (<Icon {...p}><path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/></Icon>),
  Star: (p) => (<Icon {...p}><path d="M12 3l2.7 5.5L21 9.5l-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-1z"/></Icon>),
};

window.I = I;
