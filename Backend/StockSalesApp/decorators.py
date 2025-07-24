from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from functools import wraps

def pin_required(view_func):
    """
    Wont let the user get into a page if the pin has not been inserted
    """
    @wraps(view_func)
    @login_required
    def _wrapped_view(request, *args, **kwargs):
        if request.session.get('pin_verified'):
            del request.session['pin_verified']
            return view_func(request, *args, **kwargs)
        else:
            return redirect('pin_verify_view')
    return _wrapped_view
