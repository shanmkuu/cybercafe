import React from 'react';
import Icon from '../../../components/AppIcon';

const BrandingHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto shadow-lg glow-card">
          <Icon name="Shield" size={40} color="white" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
          <Icon name="Wifi" size={12} color="white" />
        </div>
      </div>

      {/* Title and Tagline */}
      <h1 className="text-3xl font-bold text-foreground mb-2">
        CyberCafe Tracker
      </h1>
      <p className="text-lg text-muted-foreground mb-4">
        Secure Workstation Management System
      </p>
      
      {/* Subtitle */}
      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <Icon name="MapPin" size={16} />
        <span>Local Network Access Portal</span>
      </div>

      {/* Security Badge */}
      <div className="mt-6 inline-flex items-center space-x-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full">
        <Icon name="Lock" size={14} className="text-success" />
        <span className="text-xs font-medium text-success">SSL Secured Connection</span>
      </div>
    </div>
  );
};

export default BrandingHeader;