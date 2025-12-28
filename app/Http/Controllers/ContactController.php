<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactFormMail;
use Illuminate\Support\Facades\Log;
use App\Models\ContactMessage;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        try {
            // Log the incoming request data
            Log::info('Contact form request received', $request->all());

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'subject' => 'required|string|max:255',
                'message' => 'required|string'
            ]);

            Log::info('Contact form validation passed', $validated);

            // Lưu vào bảng contact_messages
            ContactMessage::create($validated);

            // Check if mail configuration is set
            if (empty(config('mail.mailers.smtp.host'))) {
                throw new \Exception('Mail configuration is not set properly');
            }

            // Send email
            Mail::to('ntn198244@gmail.com')->send(new ContactFormMail($validated));
            
            Log::info('Contact form email sent successfully');
            
            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent successfully!'
            ])->header('Access-Control-Allow-Origin', '*')
              ->header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
              ->header('Access-Control-Allow-Headers', 'Content-Type, Accept');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Contact form validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ])->header('Access-Control-Allow-Origin', '*')
              ->header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
              ->header('Access-Control-Allow-Headers', 'Content-Type, Accept');
        } catch (\Exception $e) {
            Log::error('Contact form error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'mail_config' => [
                    'host' => config('mail.mailers.smtp.host'),
                    'port' => config('mail.mailers.smtp.port'),
                    'username' => config('mail.mailers.smtp.username'),
                    'encryption' => config('mail.mailers.smtp.encryption')
                ]
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message. Please try again later.',
                'error' => $e->getMessage()
            ], 500)->header('Access-Control-Allow-Origin', '*')
                  ->header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
                  ->header('Access-Control-Allow-Headers', 'Content-Type, Accept');
        }
    }

    public function index(Request $request)
    {
        $query = ContactMessage::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('message', 'like', "%$search%")
                  ->orWhere('subject', 'like', "%$search%") ;
            });
        }
        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);
        // Pagination
        $perPage = intval($request->get('per_page', 10));
        $messages = $query->paginate($perPage);
        return response()->json($messages);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:new,read,responded,archived,pending,spam'
        ]);
        $msg = ContactMessage::findOrFail($id);
        $msg->status = $request->status;
        $msg->save();
        return response()->json(['success' => true]);
    }
}