import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase';

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is missing');
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        typescript: true,
    });
};

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = getStripe().webhooks.constructEvent(body, sig, endpointSecret!);
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const supabase = await createClient();

    // Handle high-priority billing events
    switch (event.type) {
        case 'invoice.paid': {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = invoice.customer as string;
            const { data: user } = await supabase.from('profiles').select('id').eq('stripe_customer_id', customerId).single();

            if (user) {
                await supabase.from('profiles').update({ subscription_status: 'active' }).eq('id', user.id);
            }
            break;
        }
        case 'customer.subscription.deleted': {
            const sub = event.data.object as Stripe.Subscription;
            const customerId = sub.customer as string;
            await supabase.from('profiles').update({ subscription_status: 'inactive' }).eq('stripe_customer_id', customerId);
            break;
        }
        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = invoice.customer as string;
            // Revoke access immediately on failed payment
            await supabase.from('profiles').update({ subscription_status: 'past_due' }).eq('stripe_customer_id', customerId);
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
