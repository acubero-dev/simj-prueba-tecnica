<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function list()
    {
        $user = Auth::user();

        $projects = $user->is_admin
            ? Project::with('user')->latest()->get()
            : Project::with('user')->where('user_id', $user->id)->latest()->get();

        return response()->json($projects);
    }

    public function create()
    {
        //
    }

    public function update()
    {
        //
    }

    public function delete()
    {
        //
    }
}
