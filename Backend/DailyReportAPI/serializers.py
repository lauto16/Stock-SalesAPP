from rest_framework import serializers
from .models import DailyReport


class DailyReportSerializer(serializers.ModelSerializer):
    profit = serializers.SerializerMethodField()
    is_todays = serializers.SerializerMethodField()

    class Meta:
        model = DailyReport
        fields = ("id", "created_at", "gain", "loss", "profit", "is_todays")
        read_only_fields = fields

    def get_profit(self, obj):
        return obj.profit
    
    def get_is_todays(self, obj):
        return obj.is_todays