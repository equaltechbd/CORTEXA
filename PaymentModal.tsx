import React from 'react';
import { CourseOffering } from '../types';

interface PaymentModalProps {
  course: CourseOffering;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ course, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        backgroundColor: '#1e1f20',
        borderRadius: '1.5rem',
        padding: '2rem',
        width: '90%',
        maxWidth: '450px',
        border: '1px solid #333',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: '#c4c7c5',
            cursor: 'pointer',
            fontSize: '1.5rem'
          }}
        >
          <i className="ph ph-x"></i>
        </button>

        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: 'rgba(168, 199, 250, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <i className={`ph ${course.iconClass}`} style={{ fontSize: '2rem', color: '#a8c7fa' }}></i>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: '#e3e3e3' }}>
          {course.title}
        </h2>
        
        <div style={{ 
          background: 'rgba(240, 192, 72, 0.1)', 
          color: '#f0c048', 
          display: 'inline-block',
          padding: '0.2rem 0.8rem',
          borderRadius: '1rem',
          fontSize: '0.8rem',
          marginBottom: '1.5rem'
        }}>
          PRO ACCESS
        </div>

        <div style={{ marginBottom: '2rem', textAlign: 'left', background: '#28292a', padding: '1rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#c4c7c5' }}>Duration</span>
            <span style={{ fontWeight: 500 }}>{course.duration}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#c4c7c5' }}>Total Cost</span>
            <span style={{ fontWeight: 500, color: '#f0c048' }}>{course.price}</span>
          </div>
        </div>

        <button style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: '#a8c7fa',
          color: '#000',
          border: 'none',
          borderRadius: '2rem',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '1rem'
        }}>
          Proceed to Checkout
        </button>
        
        <p style={{ fontSize: '0.75rem', color: '#c4c7c5' }}>
          Secure payment powered by SSLCommerz
        </p>
      </div>
    </div>
  );
};