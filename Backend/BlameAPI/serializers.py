from django.core.exceptions import ObjectDoesNotExist
from InventoryAPI.models import Provider
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
        try:
            content = obj.content_object
        except (ObjectDoesNotExist, ValueError, TypeError):
            return None

        if not content:
            return None

        return {
            "code": getattr(content, "code", None),
            "name": getattr(content, "name", None),
            "provider_name": getattr(getattr(content, "provider", None), "name", None)
        }
        
    def to_representation(self, instance):
        rep = super().to_representation(instance)

        if instance.field_name == "provider":
            old_provider = None
            new_provider = None

            try:
                if instance.old_value:
                    old_provider = Provider.objects.filter(id=instance.old_value).first()
            except (ValueError, TypeError):
                old_provider = None

            try:
                if instance.new_value:
                    new_provider = Provider.objects.filter(id=instance.new_value).first()
            except (ValueError, TypeError):
                new_provider = None

            rep["old_value"] = old_provider.name if old_provider else ""
            rep["new_value"] = new_provider.name if new_provider else ""

        return rep