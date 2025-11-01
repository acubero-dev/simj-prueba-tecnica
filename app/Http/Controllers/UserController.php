<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function list()
    {
        $users = User::latest()->get();

        return response()->json($users, 200);
    }

    public function create(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:4',
            'is_admin' => 'sometimes|boolean',
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return response()->json($user, 201);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($request->input('id'))],
            'password' => 'nullable|string|min:4',
            'is_admin' => 'sometimes|boolean',
        ]);

        $user = User::findOrFail($data['id']);

        $user->name = $data['name'];
        $user->email = $data['email'];

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        if (isset($data['is_admin'])) {
            $user->is_admin = $data['is_admin'];
        }
        $user->save();

        return response()->json($user, 200);    
    }

    public function delete(Request $request)
    {
        $data = $request->validate([
            'id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($data['id']);
        $user->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente.']);
    }
}
