from django.db import models

class Destino(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=50)
    cover = models.ImageField(upload_to='destinations/', null=True, blank=True)
    description = models.CharField(max_length=300, blank=True)
    pub_date = models.DateField(auto_now_add=True)

    class Meta:
        verbose_name = "Destino"
        verbose_name_plural = "Destinos"
        ordering = ['name']

    def __str__(self):
        return self.name

class Tour(models.Model):
    # related_name changed to 'tours' as requested
    destino = models.ForeignKey(
        'Destino', 
        on_delete=models.PROTECT, 
        related_name='tours'
    )
    name = models.CharField(max_length=100)
    duration = models.IntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    photo = models.ImageField(upload_to='tours/', null=True, blank=True)
    description = models.CharField(max_length=300, blank=True)
    pub_date = models.DateField(auto_now_add=True)

    class Meta:
        verbose_name = "Tour"
        verbose_name_plural = "Tours"
        ordering = ['-pub_date']

    def __str__(self):
        return self.name

class Reserva(models.Model):
    STATUS_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
    ]
    
    tour = models.ForeignKey(
        'Tour', 
        on_delete=models.CASCADE, 
        related_name='reservas'
    )
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    date = models.DateField()
    people_count = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True)
    # Added status field with choices
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pendiente'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ['-created_at']

    def __str__(self):
        return f"Reserva de {self.customer_name} para {self.tour.name}"
