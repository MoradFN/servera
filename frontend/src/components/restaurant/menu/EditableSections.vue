<template>
  <draggable
    :modelValue="editableSections"
    @update:modelValue="emitUpdate"
    @end="onDragEnd"
    class="draggable-list"
    handle=".drag-handle"
  >
    <div
      v-for="section in editableSections"
      :key="section.id || section.section_order"
      class="editable-section"
      :class="{ dashed: editMode }"
    >
      <div v-if="editMode" class="section-controls">
        <span class="drag-handle">☰</span>
        <select v-model="section.section_type" @change="onChange">
          <option value="title">Title</option>
          <option value="text">Text</option>
          <option value="image">Image</option>
        </select>
        <button class="remove-button" @click="removeSection(section)">
          Remove
        </button>
      </div>

      <template v-if="editMode">
        <div v-if="section.section_type === 'title'">
          <input
            v-model="section.content"
            placeholder="Enter title content"
            class="input"
            @input="onChange"
          />
        </div>
        <div v-else-if="section.section_type === 'text'">
          <textarea
            v-model="section.content"
            placeholder="Enter text content"
            class="textarea"
            @input="onChange"
          ></textarea>
        </div>
        <div v-else-if="section.section_type === 'image'">
          <input
            v-model="section.content"
            placeholder="Enter image URL"
            class="input"
            @input="onChange"
          />
        </div>
      </template>

      <template v-else>
        <component :is="getSectionTag(section.section_type)">
          {{ section.content }}
        </component>
      </template>
    </div>
  </draggable>
  <div v-if="editMode" class="add-section-container">
    <button @click="addSection">Add Section</button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { VueDraggableNext } from "vue-draggable-next";

const draggable = VueDraggableNext;

const props = defineProps({
  modelValue: { type: Array, required: true },
  editMode: { type: Boolean, required: true },
});

const emit = defineEmits(["update:modelValue", "change"]);

const editableSections = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const emitUpdate = (value) => {
  editableSections.value = value;
};

const onDragEnd = () => {
  editableSections.value.forEach((section, index) => {
    section.section_order = index + 1;
  });
  emit("update:modelValue", editableSections.value);
  emit("change");
};

const addSection = () => {
  emit("update:modelValue", [
    ...editableSections.value,
    {
      id: null,
      section_order: editableSections.value.length + 1,
      section_type: "text",
      content: "",
    },
  ]);
  emit("change");
};

const removeSection = (section) => {
  emit(
    "update:modelValue",
    editableSections.value.filter((s) => s !== section)
  );
  emit("change");
};

const onChange = () => {
  emit("change");
};

const getSectionTag = (sectionType) => {
  switch (sectionType) {
    case "title":
      return "h2";
    case "text":
      return "p";
    case "image":
      return "img";
    default:
      return "div";
  }
};
</script>
<style>
/* Editable Sections */
.editable-section {
  padding: 10px;
  margin-bottom: 10px;
  position: relative;
}
.editable-section.dashed {
  border: 1px dashed #007bff;
  border-radius: 4px;
}

/* Section Controls */
.section-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.drag-handle {
  cursor: grab;
}

/* Content Styles */
.input,
.textarea {
  width: 100%;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.read-only-content {
  display: inline-block;
  width: 100%;
}

/* Sticky Save Changes Bar */
.save-changes-bar {
  position: sticky;
  top: -50px;
  background-color: #007bff;
  color: white;
  text-align: center;
  padding: 10px;
  z-index: 10;
  transition: top 0.3s ease-in-out;
}
.save-changes-bar.visible {
  top: 0;
}

/* Remove Button */
.remove-button {
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

/* Draggable List */
.draggable-list {
  margin-bottom: 20px;
}

/* Owner Controls */
.owner-controls {
  margin-bottom: 20px;
}

/* Add Section Button */
.add-section-container {
  text-align: center;
  margin-top: 10px;
}
.add-section-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
.add-section-button:hover {
  background-color: #218838;
}

/* Transition Effects */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
