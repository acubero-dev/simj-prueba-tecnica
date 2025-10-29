<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function list(Request $request)
    {
        $query = User::query();

        // Filtro por búsqueda
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('name', 'like', "%$search%")
                ->orWhere('email', 'like', "%$search%");
        }

        // Paginación
        $users = $query->orderBy('id', 'desc')->paginate(100);

        return response()->json($users);
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:4',
            'is_admin' => 'sometimes|boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($request->input('id'))],
            'password' => 'nullable|string|min:4',
            'is_admin' => 'sometimes|boolean',
        ]);

        $user = User::findOrFail($validated['id']);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        if (isset($validated['is_admin'])) {
            $user->is_admin = $validated['is_admin'];
        }
        $user->save();

        return response()->json($user);
    }

    public function delete(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($validated['id']);
        $user->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente.']);
    }
}
