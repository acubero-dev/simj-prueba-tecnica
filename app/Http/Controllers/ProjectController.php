<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function list()
    {
        $projects = Project::with('user')
            ->withMax('tasks', 'created_at') // Obtener la fecha de la última tarea creada
            ->orderByDesc('tasks_max_created_at') // Ordenar por última tarea primero
            ->orderByDesc('created_at') // Si no tiene tareas, ordenar por fecha de creación del proyecto
            ->get();

        return response()->json($projects, 200);
    }

    public function create(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $data['user_id'] = $user->id;

        $project = Project::create($data);

        return response()->json($project, 201);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'id' => 'required|exists:projects,id',
            'name' => 'required|string|max:255',
        ]);

        $project = Project::findOrFail($data['id']);

        $project->name = $data['name'];
        $project->save();

        return response()->json($project, 200);
    }

    public function delete(Request $request)
    {
        $data = $request->validate([
            'id' => 'required|exists:projects,id',
        ]);

        $project = Project::findOrFail($data['id']);
        $project->delete();

        return response()->json(['message' => 'Proyecto eliminado correctamente.']);
    }
}
