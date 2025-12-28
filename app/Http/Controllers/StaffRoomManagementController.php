<?php

namespace App\Http\Controllers;

use App\Models\StaffRoomManagement;
use Illuminate\Http\Request;

class StaffRoomManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rooms = \App\Models\StaffRoomManagement::all();
        return response()->json($rooms);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_number' => 'required|unique:rooms,room_number',
            'type' => 'required',
            'status' => 'required',
            'price' => 'required|numeric',
            'description' => 'nullable',
        ]);
        $room = \App\Models\StaffRoomManagement::create($validated);
        return response()->json($room, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $room = \App\Models\StaffRoomManagement::findOrFail($id);
        return response()->json($room);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(\App\Models\StaffRoomManagement $StaffRoomManagement)
    {
        return view('staff.rooms.edit', compact('StaffRoomManagement'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $room = \App\Models\StaffRoomManagement::findOrFail($id);
        $validated = $request->validate([
            'room_number' => 'unique:rooms,room_number,' . $id,
            'type' => '',
            'status' => '',
            'price' => 'numeric',
            'description' => 'nullable',
        ]);
        $room->update($validated);
        return response()->json($room);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $room = \App\Models\StaffRoomManagement::findOrFail($id);
        $room->delete();
        return response()->json(['message' => 'Xóa phòng thành công']);
    }
}
