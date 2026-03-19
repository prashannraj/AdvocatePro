<?php

namespace App\Http\Middleware;

use App\Models\Subscription;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SubscriptionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip check for activation and status routes
        if ($request->is('api/subscription/*') || $request->is('api/subscription')) {
            return $next($request);
        }

        if (!Subscription::isActive()) {
            return response()->json([
                'error' => 'Subscription required',
                'message' => 'Your annual subscription has expired or is not active. Please enter a new activation key.',
                'code' => 'SUBSCRIPTION_EXPIRED'
            ], 403);
        }

        return $next($request);
    }
}
