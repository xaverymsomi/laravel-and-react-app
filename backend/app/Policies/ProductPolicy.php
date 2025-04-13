<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProductPolicy
{
    use HandlesAuthorization;

    public function update(?User $user, Product $product)
    {
        // Only allow if user exists and owns the product
        return $user && $user->id === $product->user_id;
    }

    public function delete(?User $user, Product $product)
    {
        return $user && $user->id === $product->user_id;
    }
}
