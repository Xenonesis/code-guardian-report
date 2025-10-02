export default async function handler(request: Request) {
  // Parse the request method and body
  const { method } = request;
  
  if (method === 'POST') {
    try {
      // Get the request body
      const body = await request.json();
      
      // Log subscription data (in a real implementation, you would store this in a database)
      console.log('Push subscription received:', body);
      
      // For now, just return success
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Push subscription error:', error);
      return new Response(JSON.stringify({ error: 'Failed to process subscription' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } else if (method === 'GET') {
    // Return subscription status
    return new Response(JSON.stringify({ 
      status: 'push subscription endpoint is working',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } else {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
