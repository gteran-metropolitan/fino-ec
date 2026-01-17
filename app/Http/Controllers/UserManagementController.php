<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::query()
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('users/create', [
            'roles' => $this->getAvailableRoles(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
            'role' => ['required', 'string', Rule::in(['admin', 'user'])],
            'is_active' => ['boolean'],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
            'email_verified_at' => now(),
        ]);

        return redirect()->route('users.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return Inertia::render('users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        return Inertia::render('users/edit', [
            'user' => $user,
            'roles' => $this->getAvailableRoles(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        // Prevenir modificación del super admin por otro usuario
        if ($user->isSuperAdmin() && !auth()->user()->isSuperAdmin()) {
            abort(403, 'No puedes modificar al Super Admin.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', Password::defaults(), 'confirmed'],
            'role' => ['required', 'string', Rule::in(['super_admin', 'admin', 'user'])],
            'is_active' => ['boolean'],
        ]);

        // Solo super admin puede asignar role super_admin
        if ($validated['role'] === 'super_admin' && !auth()->user()->isSuperAdmin()) {
            $validated['role'] = $user->role;
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? $user->is_active,
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => $validated['password']]);
        }

        return redirect()->route('users.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Prevenir eliminación del super admin
        if ($user->isSuperAdmin()) {
            return back()->withErrors(['error' => 'No se puede eliminar al Super Admin.']);
        }

        // Prevenir auto-eliminación
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes eliminarte a ti mismo.']);
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'Usuario eliminado exitosamente.');
    }

    /**
     * Toggle user active status.
     */
    public function toggleActive(User $user)
    {
        // Prevenir desactivación del super admin
        if ($user->isSuperAdmin()) {
            return back()->withErrors(['error' => 'No se puede desactivar al Super Admin.']);
        }

        // Prevenir auto-desactivación
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes desactivarte a ti mismo.']);
        }

        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'activado' : 'desactivado';
        return back()->with('success', "Usuario {$status} exitosamente.");
    }

    /**
     * Get available roles for assignment.
     */
    private function getAvailableRoles(): array
    {
        return [
            ['value' => 'admin', 'label' => 'Administrador'],
            ['value' => 'user', 'label' => 'Usuario'],
        ];
    }
}
