import torch
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import ast

class HandLandMarkDataset(Dataset):
    def __init__(self, dataframe, landmarks_column, label_column, sequence_length=30, transform=None):
        """
        Args:
            dataframe (pd.DataFrame): Pandas DataFrame containing the hand landmarks and labels.
            landmarks_column (str): Name of the column containing the nested lists.
            label_column (str): Name of the column containing the labels.
            sequence_length (int): Number of frames per sequence (default: 30).
            transform (callable, optional): Optional transform to be applied on a sample.
        """
        self.data = dataframe
        self.landmarks_column = landmarks_column
        self.label_column = label_column
        self.sequence_length = sequence_length
        self.transform = transform
        self.data["original_index"] = self.data.index  


        # Define label mapping
        label_mapping = {
            "left": 0,
            "right": 1,
            "stop": 2,
            "up": 3,
            "down": 4
        }

        # Function to convert labels
        def map_labels(label):
            if isinstance(label, str):  # Ensure it's a string before calling .lower()
                label = label.lower()
                for key, value in label_mapping.items():
                    if key in label:
                        return value
            return -1  # Default if label is not recognized

        # Apply label mapping
        self.data[label_column] = self.data[label_column].apply(map_labels)
        print(f"Total rows in dataset after filtering: {len(self.data)}")


        # Remove invalid (-1) labels
        self.data = self.data[self.data[label_column] != -1].reset_index(drop=True)
        print(f"Total rows in dataset after filtering: {len(self.data)}")


        # Group into sequences
        # self.sequences = [
        #     (self.data[landmarks_column].iloc[i : i + sequence_length].tolist(),
        #      self.data[label_column].iloc[i])  # Use label from first row of the sequence
        #     for i in range(0, len(self.data) - sequence_length + 1, sequence_length)
        # ]
        self.sequences = [
            (torch.tensor(self.data[landmarks_column].iloc[i : i + sequence_length].tolist(), dtype=torch.float32).view(sequence_length, 21, 3),
            torch.tensor(self.data[label_column].iloc[i], dtype=torch.long),
            self.data["original_index"].iloc[i])
            for i in range(0, len(self.data) - sequence_length + 1, sequence_length)
        ]

        # if len(self.sequences) > 0:
        #     print(f"First sequence sample: {self.sequences[0]}")
        # else:
        #     print("No sequences were created!")





    def __len__(self):
        return len(self.sequences)

    def __getitem__(self, idx):
        sequence, label, original_index = self.sequences[idx]

        # Convert sequence into a tensor of shape (sequence_length, 21, 3)
        sequence = torch.tensor(sequence, dtype=torch.float32)
        label = torch.tensor(label, dtype=torch.long)  # Ensure label is long for classification

        # Reshape from (30, 21, 3) -> (30, 63)
        sequence = sequence.view(self.sequence_length, -1)  

        if self.transform:
            sequence = self.transform(sequence)
        

        return sequence, label, original_index



