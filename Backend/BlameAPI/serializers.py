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
        content = obj.content_object
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
            old_provider = Provider.objects.filter(id=instance.old_value).first()
            new_provider = Provider.objects.filter(id=instance.new_value).first()

            rep["old_value"] = old_provider.name if old_provider else instance.old_value
            rep["new_value"] = new_provider.name if new_provider else instance.new_value

        return rep