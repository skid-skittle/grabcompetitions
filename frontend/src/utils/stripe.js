import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your live publishable key
export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const createCheckoutSession = async (competitionId, ticketCount, userId, balanceUsed = 0) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        competition_id: competitionId,
        ticket_count: ticketCount,
        user_id: userId,
        balance_used: balanceUsed
      }),
    });

    const session = await response.json();
    
    if (session.error) {
      throw new Error(session.error);
    }

    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.sessionId,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
};
