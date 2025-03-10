import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import os
import glob
import os

# Define image transformations

class GestureSequenceDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        """
        root_dir: Path to dataset folder containing gesture sequence subfolders
        transform: Image transformations
        """
        self.root_dir = root_dir
        self.transform = transform
        self.sequences = []
        
        # Scan all sequence folders
        for gesture_folder in sorted(os.listdir(root_dir)):  
            seq_path = os.path.join(root_dir, gesture_folder)
            if os.path.isdir(seq_path):  # Only process folders
                self.sequences.append(seq_path)

    def __len__(self):
        return len(self.sequences)

    def __getitem__(self, idx):
        seq_folder = self.sequences[idx]
        
        # Load all images in sorted order (frame_01, frame_02, etc.)

        image_paths = sorted(glob.glob(os.path.join(seq_folder, "*.png")))

        images = []
        for img_path in image_paths:
            image = Image.open(img_path).convert("L")  # Convert to grayscale (use "RGB" if needed)
            if self.transform:
                image = self.transform(image)
            images.append(image)

        # Stack images to create a (sequence_length, C, H, W) tensor
        images = torch.stack(images)  # Shape: (T, C, H, W)

        # Extract label from folder name (assuming gesture1_seq1 → gesture1)
        label_idx = 5
        if seq_folder.lower().find("left") != -1:
            label_idx = 0
        elif seq_folder.lower().find("right") != -1:
            label_idx = 1
        elif seq_folder.lower().find("stop") != -1:
            label_idx = 2
        elif seq_folder.lower().find("up") != -1:
            label_idx = 3
        elif seq_folder.lower().find("down") != -1:
            label_idx = 4            

        return images, label_idx  # (Sequence, Label)




