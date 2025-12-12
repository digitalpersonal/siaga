
import React from 'react';
import { plans } from '../constants';
import type { Plan } from '../types';

const CheckIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => {
  const cardClasses = plan.highlight
    ? 'bg-rose-500 text-white shadow-2xl scale-105'
    : 'bg-white text-stone-800 shadow-lg';
  const buttonClasses = plan.highlight
    ? 'bg-white text-rose-500 hover:bg-rose-100'
    : 'bg-rose-500 text-white hover:bg-rose-600';
  const textColor = plan.highlight ? 'text-rose-100' : 'text-stone-500';

  return (
    <div className={`p-8 rounded-2xl border-t-4 ${plan.highlight ? 'border-rose-300' : 'border-rose-500'} ${cardClasses} transition-transform duration-300 flex flex-col`}>
      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
      <p className={`text-4xl font-extrabold mb-4`}>{plan.price}</p>
      <ul className="space-y-4 mb-8 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <div className={`rounded-full p-1 mr-3 ${plan.highlight ? 'bg-white/20' : 'bg-rose-100'}`}>
                <CheckIcon />
            </div>
            <span className={textColor}>{feature}</span>
          </li>
        ))}
      </ul>
      <button className={`w-full font-bold py-3 px-6 rounded-full transition-colors duration-300 ${buttonClasses}`}>
        Assinar Agora
      </button>
    </div>
  );
};

export const PricingPlans: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800">Planos e Assinaturas</h2>
          <p className="text-stone-500 mt-2 text-lg">Escolha o plano perfeito para suas necessidades e economize.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};
