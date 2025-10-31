<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function list()
    {
        $tasks = Task::with(['project', 'user'])
            ->latest()
            ->get();

        return response()->json($tasks, 200);
    }

    public function listByUser(Request $request)
    {
        $tasks = Task::where('user_id', $request->user_id)
            ->with(['project', 'user'])
            ->latest()
            ->get();

        return response()->json($tasks, 200);
    }

    public function create(Request $request)
    {
        $data = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
        ]);

        $task = Task::create($data);

        return response()->json($task, 201);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'id' => 'required|exists:tasks,id',
            'start_at' => 'sometimes|date',
            'end_at' => 'sometimes|date|after:start_at',
        ]);

        if (isset($data['start_at']) && isset($data['end_at'])) {
            if ($data['end_at'] <= $data['start_at']) {
                return response()->json(['error' => 'La fecha fin debe ser posterior a la fecha inicio'], 422);
            }
        }

        $task = Task::findOrFail($data['id']);
        $task->update($data);

        return response()->json($task);
    }

    public function delete(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:tasks,id',
        ]);

        Task::destroy($request->id);

        return response()->json(['message' => 'Tarea eliminada']);
    }
}
