<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
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


    public function generatePdfData(Request $request)
    {
        $filters = $request->validate([
            'user_id' => 'required|exists:users,id',
            'project_id' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);

        $query = Task::with(['project', 'user'])
                    ->where('user_id', $filters['user_id'])
                    ->whereDate('start_at', '>=', $filters['start_date'])
                    ->whereDate('start_at', '<=', $filters['end_date']);

        if ($filters['project_id'] !== "all") {
            $query->where('project_id', $filters['project_id']);
        }

        $tasks = $query->orderBy('start_at')->get(); // Ordenar por fecha

        // Formatear datos para el PDF
        $formattedTasks = $tasks->map(function($task) {
            $startAt = \Carbon\Carbon::parse($task->start_at);
            $endAt = \Carbon\Carbon::parse($task->end_at);
            
            return [
                'project' => $task->project->name,
                'description' => $task->description ?? '-',
                'start_at' => $startAt->format('d/m/Y H:i'),
                'end_at' => $endAt->format('d/m/Y H:i'),
                'duration' => $startAt->diffInMinutes($endAt)
            ];
        });

        // Calcular totales por proyecto
        $totals = [];
        foreach ($tasks->groupBy('project_id') as $projectTasks) {
            $projectName = $projectTasks->first()->project->name;
            $totalMinutes = $projectTasks->sum(function($task) {
                return \Carbon\Carbon::parse($task->start_at)
                    ->diffInMinutes(\Carbon\Carbon::parse($task->end_at));
            });
            $totals[$projectName] = $totalMinutes;
        }

        return response()->json([
            'tasks' => $formattedTasks,
            'totals' => $totals
        ]);
    }


}
