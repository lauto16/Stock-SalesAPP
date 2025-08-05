from rest_framework import serializers
from .models import ChangeLog


class ChangeLogSerializer(serializers.ModelSerializer):
    model = serializers.SerializerMethodField()
    changed_by = serializers.StringRelatedField()
    object_id = serializers.CharField()
    object_data = serializers.SerializerMethodField()

    class Meta:
        model = ChangeLog
        fields = [
            "id",
            "model",
            "object_id",
            "object_data",
            "field_name",
            "old_value",
            "new_value",
            "changed_by",
            "changed_at",
        ]

    def get_model(self, obj):
        return obj.content_type.model

    def get_object_data(self, obj):
        content = obj.content_object
        if not content:
            return None

        return {
            "code": getattr(content, "code", None),
            "name": getattr(content, "name", None),
        }