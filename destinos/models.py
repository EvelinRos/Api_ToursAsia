from django.db import models
from django.conf import settings

class Destino(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=50)
    cover = models.ImageField(upload_to='destinations/', null=True, blank=True)
    cover_url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    fun_fact = models.TextField(blank=True)
    best_time = models.CharField(max_length=100, blank=True)
    language = models.CharField(max_length=50, blank=True)
    currency = models.CharField(max_length=50, blank=True)
    highlights = models.JSONField(default=list, blank=True)
    pub_date = models.DateField(auto_now_add=True)
    
    @property
    def image_src(self):
        if self.cover:
            return self.cover.url
        return self.cover_url or ''

    def __str__(self):
        return self.name

class Tour(models.Model):
    destino = models.ForeignKey('Destino', on_delete=models.PROTECT, 
                                 related_name='tours')
    name = models.CharField(max_length=150)
    duration = models.IntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    photo = models.ImageField(upload_to='tours/', null=True, blank=True)
    photo_url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    what_includes = models.JSONField(default=list)
    what_not_includes = models.JSONField(default=list)
    meeting_point = models.CharField(max_length=300, blank=True)
    time_slots = models.JSONField(default=list)
    is_popular = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.9)
    reviews_count = models.IntegerField(default=0)
    pub_date = models.DateField(auto_now_add=True)
    
    @property
    def image_src(self):
        if self.photo:
            return self.photo.url
        return self.photo_url or ''

    def __str__(self):
        return self.name

class Reserva(models.Model):
    STATUS_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
    ]
    PAYMENT_CHOICES = [
        ('tarjeta', 'Tarjeta'),
        ('paypal', 'PayPal'),
    ]
    LANG_CHOICES = [
        ('Español', 'Español'),
        ('English', 'English'),
        ('Português', 'Português'),
        ('日本語', '日本語'),
        ('中文', '中文'),
    ]
    
    tour = models.ForeignKey('Tour', on_delete=models.CASCADE, 
                              related_name='reservas')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, 
                              on_delete=models.SET_NULL,
                              null=True, blank=True, related_name='reservas')
    
    date = models.DateField()
    time_slot = models.CharField(max_length=20, default='09:00 AM')
    adults = models.PositiveIntegerField(default=1)
    children = models.PositiveIntegerField(default=0)
    language = models.CharField(max_length=30, choices=LANG_CHOICES, 
                                 default='Español')
    
    customer_name = models.CharField(max_length=100)
    customer_lastname = models.CharField(max_length=100, blank=True)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=30, blank=True)
    customer_country = models.CharField(max_length=60, blank=True)
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, 
                                       default='tarjeta')
    coupon_code = models.CharField(max_length=30, blank=True)
    discount_amount = models.DecimalField(max_digits=8, decimal_places=2, 
                                           default=0)
    service_fee = models.DecimalField(max_digits=8, decimal_places=2, 
                                       default=3.00)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, 
                                        default=0)
    
    notes = models.TextField(blank=True)
    people_count = models.PositiveIntegerField(default=1)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, 
                               default='pendiente')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Reserva'
        verbose_name_plural = 'Reservas'
    
    def __str__(self):
        return f"#{self.pk} - {self.customer_name} → {self.tour.name}"
    
    @property
    def total_participants(self):
        return self.adults + self.children
