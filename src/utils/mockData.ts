import type { Experiment } from '../types';
import { generateId } from './storage';

const createMockExperiment = (
  name: string,
  description: string,
  versionsData: Array<{
    script: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Record<string, any>;
    description: string;
    resultFiles: Array<{ name: string; content: string }>;
    createdAtOffset: number;
    isRollback?: boolean;
    rollbackFrom?: number;
  }>
): Experiment => {
  const expId = generateId();
  const now = Date.now();

  const versions = versionsData.map((v, index) => {
    const versionId = generateId();
    return {
      id: versionId,
      experimentId: expId,
      versionNumber: index + 1,
      script: v.script,
      params: v.params,
      description: v.description,
      isRollback: v.isRollback || false,
      rollbackFromVersionId: v.rollbackFrom !== undefined ? undefined : undefined,
      createdAt: new Date(now - v.createdAtOffset).toISOString(),
      resultFiles: v.resultFiles.map((rf) => ({
        id: generateId(),
        versionId,
        name: rf.name,
        size: `${Math.round(rf.content.length / 1024)} KB`,
        type: rf.name.split('.').pop() || 'txt',
        content: rf.content,
        createdAt: new Date(now - v.createdAtOffset).toISOString(),
      })),
    };
  });

  if (versionsData.some((v) => v.rollbackFrom !== undefined)) {
    versions.forEach((ver, idx) => {
      const vData = versionsData[idx];
      if (vData.rollbackFrom !== undefined) {
        const targetVersion = versions.find(
          (v) => v.versionNumber === vData.rollbackFrom! + 1
        );
        if (targetVersion) {
          ver.rollbackFromVersionId = targetVersion.id;
        }
      }
    });
  }

  return {
    id: expId,
    name,
    description,
    currentVersionId: versions[versions.length - 1].id,
    createdAt: new Date(now - versionsData[versionsData.length - 1].createdAtOffset).toISOString(),
    updatedAt: new Date(now - versionsData[0].createdAtOffset).toISOString(),
    versions: versions.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ),
  };
};

const imageClassificationScriptV1 = `import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

def train_model():
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    train_dataset = datasets.ImageFolder('./data/train', transform=transform)
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    
    model = models.resnet18(pretrained=True)
    model.fc = nn.Linear(512, 10)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    for epoch in range(10):
        running_loss = 0.0
        for inputs, labels in train_loader:
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        print(f'Epoch {epoch+1}, Loss: {running_loss/len(train_loader)}')
    
    torch.save(model.state_dict(), 'model.pth')
    return model

if __name__ == '__main__':
    train_model()`;

const imageClassificationScriptV2 = `import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models

def train_model():
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    train_dataset = datasets.ImageFolder('./data/train', transform=transform)
    val_dataset = datasets.ImageFolder('./data/val', transform=transform)
    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False)
    
    model = models.resnet50(pretrained=True)
    for param in model.parameters():
        param.requires_grad = False
    model.fc = nn.Linear(2048, 10)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.fc.parameters(), lr=0.0001, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.1)
    
    best_acc = 0.0
    for epoch in range(20):
        model.train()
        running_loss = 0.0
        for inputs, labels in train_loader:
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                outputs = model(inputs)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        
        acc = 100 * correct / total
        scheduler.step()
        print(f'Epoch {epoch+1}, Train Loss: {running_loss/len(train_loader):.4f}, Val Acc: {acc:.2f}%')
        
        if acc > best_acc:
            best_acc = acc
            torch.save(model.state_dict(), 'best_model.pth')
    
    return model, best_acc

if __name__ == '__main__':
    train_model()`;

const imageClassificationScriptV3 = `import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models

def train_model():
    transform_train = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomCrop((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    transform_val = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    train_dataset = datasets.ImageFolder('./data/train', transform=transform_train)
    val_dataset = datasets.ImageFolder('./data/val', transform=transform_val)
    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True, num_workers=4, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False, num_workers=4, pin_memory=True)
    
    model = models.resnet50(pretrained=True)
    for param in model.parameters():
        param.requires_grad = False
    
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(2048, 512),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(512, 10)
    )
    
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = torch.optim.AdamW(model.fc.parameters(), lr=0.0001, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=30)
    
    scaler = torch.cuda.amp.GradScaler()
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    best_acc = 0.0
    for epoch in range(30):
        model.train()
        running_loss = 0.0
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            
            with torch.cuda.amp.autocast():
                outputs = model(inputs)
                loss = criterion(outputs, labels)
            
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            
            running_loss += loss.item()
        
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        
        acc = 100 * correct / total
        scheduler.step()
        print(f'Epoch {epoch+1}, Train Loss: {running_loss/len(train_loader):.4f}, Val Acc: {acc:.2f}%')
        
        if acc > best_acc:
            best_acc = acc
            torch.save(model.state_dict(), 'best_model.pth')
    
    return model, best_acc

if __name__ == '__main__':
    train_model()`;

const dataCleaningScriptV1 = `import pandas as pd
import numpy as np

def clean_data(input_path: str, output_path: str) -> pd.DataFrame:
    df = pd.read_csv(input_path)
    print(f"原始数据形状: {df.shape}")
    
    df = df.drop_duplicates()
    print(f"去重后形状: {df.shape}")
    
    df = df.dropna()
    print(f"删除空值后形状: {df.shape}")
    
    df['date'] = pd.to_datetime(df['date'])
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    
    df.to_csv(output_path, index=False)
    print(f"清洗完成，已保存到 {output_path}")
    
    return df

if __name__ == '__main__':
    clean_data('./data/raw.csv', './data/cleaned.csv')`;

const dataCleaningScriptV2 = `import pandas as pd
import numpy as np
from scipy import stats

def clean_data(input_path: str, output_path: str) -> pd.DataFrame:
    df = pd.read_csv(input_path)
    print(f"原始数据形状: {df.shape}")
    
    df = df.drop_duplicates(subset=['id', 'date'], keep='last')
    print(f"去重后形状: {df.shape}")
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    
    categorical_cols = df.select_dtypes(include=['object']).columns
    df[categorical_cols] = df[categorical_cols].fillna('unknown')
    print(f"填充空值后形状: {df.shape}")
    
    z_scores = np.abs(stats.zscore(df[numeric_cols]))
    df = df[(z_scores < 3).all(axis=1)]
    print(f"删除异常值后形状: {df.shape}")
    
    df['date'] = pd.to_datetime(df['date'])
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['day_of_week'] = df['date'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    
    df['value_normalized'] = (df['value'] - df['value'].min()) / (df['value'].max() - df['value'].min())
    
    df.to_csv(output_path, index=False)
    print(f"清洗完成，已保存到 {output_path}")
    
    return df

if __name__ == '__main__':
    clean_data('./data/raw.csv', './data/cleaned.csv')`;

const sentimentAnalysisScriptV1 = `import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout
import pandas as pd

def train_sentiment_model():
    df = pd.read_csv('./data/sentiment_data.csv')
    texts = df['text'].values
    labels = df['sentiment'].values
    
    tokenizer = Tokenizer(num_words=10000, oov_token='<OOV>')
    tokenizer.fit_on_texts(texts)
    sequences = tokenizer.texts_to_sequences(texts)
    padded = pad_sequences(sequences, maxlen=100, truncating='post', padding='post')
    
    model = Sequential([
        Embedding(10000, 64, input_length=100),
        LSTM(64, return_sequences=True),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        Dense(1, activation='sigmoid')
    ])
    
    model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
    
    history = model.fit(padded, labels, epochs=10, batch_size=32, validation_split=0.2)
    
    model.save('sentiment_model.h5')
    print("模型训练完成")
    
    return model, history

if __name__ == '__main__':
    train_sentiment_model()`;

export const generateMockData = (): Experiment[] => {
  return [
    createMockExperiment(
      '图像分类模型训练',
      '基于 ResNet 的多类别图像分类实验，探索不同超参数和网络结构对分类精度的影响',
      [
        {
          script: imageClassificationScriptV1,
          params: {
            model: 'resnet18',
            batch_size: 32,
            learning_rate: 0.001,
            epochs: 10,
            optimizer: 'adam',
            pretrained: true,
            image_size: 224,
          },
          description: '初始版本，使用 ResNet18 进行基础训练',
          resultFiles: [
            {
              name: 'metrics.json',
              content: JSON.stringify({
                final_loss: 0.3421,
                accuracy: 0.785,
                epoch_times: [12.5, 12.3, 12.4, 12.6, 12.2, 12.3, 12.5, 12.4, 12.3, 12.5],
              }, null, 2),
            },
            {
              name: 'training_logs.txt',
              content: `Epoch 1/10 - loss: 0.8923 - acc: 0.6542
Epoch 2/10 - loss: 0.6234 - acc: 0.7231
Epoch 3/10 - loss: 0.5123 - acc: 0.7543
Epoch 4/10 - loss: 0.4521 - acc: 0.7689
Epoch 5/10 - loss: 0.4123 - acc: 0.7756
Epoch 6/10 - loss: 0.3821 - acc: 0.7801
Epoch 7/10 - loss: 0.3612 - acc: 0.7823
Epoch 8/10 - loss: 0.3510 - acc: 0.7834
Epoch 9/10 - loss: 0.3456 - acc: 0.7845
Epoch 10/10 - loss: 0.3421 - acc: 0.7850`,
            },
          ],
          createdAtOffset: 86400000 * 7,
        },
        {
          script: imageClassificationScriptV2,
          params: {
            model: 'resnet50',
            batch_size: 64,
            learning_rate: 0.0001,
            epochs: 20,
            optimizer: 'adam',
            pretrained: true,
            freeze_backbone: true,
            image_size: 224,
            weight_decay: 0.0001,
            scheduler: 'step_lr',
            step_size: 5,
            gamma: 0.1,
            data_augmentation: {
              horizontal_flip: true,
              rotation: 10,
            },
          },
          description: '升级到 ResNet50，添加数据增强和学习率调度，冻结骨干网络',
          resultFiles: [
            {
              name: 'metrics.json',
              content: JSON.stringify({
                final_loss: 0.2812,
                accuracy: 0.856,
                best_accuracy: 0.862,
                epoch_times: [25.2, 25.1, 25.3, 25.0, 25.1, 25.2, 25.3, 25.1, 25.2, 25.0],
              }, null, 2),
            },
            {
              name: 'training_logs.txt',
              content: `Epoch 1/20 - Train Loss: 0.9234 - Val Acc: 72.34%
Epoch 2/20 - Train Loss: 0.6543 - Val Acc: 78.45%
Epoch 3/20 - Train Loss: 0.5234 - Val Acc: 81.23%
Epoch 4/20 - Train Loss: 0.4432 - Val Acc: 83.12%
Epoch 5/20 - Train Loss: 0.3892 - Val Acc: 84.56%
Epoch 6/20 - Train Loss: 0.3567 - Val Acc: 85.23%
Epoch 7/20 - Train Loss: 0.3345 - Val Acc: 85.78%
Epoch 8/20 - Train Loss: 0.3123 - Val Acc: 86.10%
Epoch 9/20 - Train Loss: 0.2987 - Val Acc: 86.20%
Epoch 10/20 - Train Loss: 0.2891 - Val Acc: 86.15%`,
            },
            {
              name: 'confusion_matrix.json',
              content: JSON.stringify({
                class_names: ['cat', 'dog', 'bird', 'fish', 'rabbit'],
                matrix: [
                  [185, 8, 3, 2, 2],
                  [6, 178, 5, 4, 7],
                  [4, 3, 182, 6, 5],
                  [3, 5, 7, 175, 10],
                  [5, 7, 4, 8, 176],
                ],
              }, null, 2),
            },
          ],
          createdAtOffset: 86400000 * 5,
        },
        {
          script: imageClassificationScriptV3,
          params: {
            model: 'resnet50',
            batch_size: 64,
            learning_rate: 0.0001,
            epochs: 30,
            optimizer: 'adamw',
            pretrained: true,
            freeze_backbone: true,
            image_size: 224,
            weight_decay: 0.0001,
            scheduler: 'cosine_annealing',
            t_max: 30,
            dropout_rate: 0.3,
            label_smoothing: 0.1,
            mixed_precision: true,
            data_augmentation: {
              horizontal_flip: true,
              rotation: 15,
              color_jitter: { brightness: 0.2, contrast: 0.2 },
              random_crop: true,
            },
          },
          description: '添加更强的数据增强、Dropout 层、AdamW 优化器和余弦退火调度',
          resultFiles: [
            {
              name: 'metrics.json',
              content: JSON.stringify({
                final_loss: 0.2456,
                accuracy: 0.894,
                best_accuracy: 0.898,
                epoch_times: [28.5, 28.3, 28.4, 28.6, 28.2, 28.3, 28.5, 28.4, 28.3, 28.5],
              }, null, 2),
            },
            {
              name: 'training_logs.txt',
              content: `Epoch 1/30 - Train Loss: 0.8765 - Val Acc: 74.23%
Epoch 2/30 - Train Loss: 0.6123 - Val Acc: 80.45%
Epoch 3/30 - Train Loss: 0.4876 - Val Acc: 83.67%
Epoch 4/30 - Train Loss: 0.4123 - Val Acc: 85.89%
Epoch 5/30 - Train Loss: 0.3654 - Val Acc: 87.12%
Epoch 6/30 - Train Loss: 0.3321 - Val Acc: 88.34%
Epoch 7/30 - Train Loss: 0.3087 - Val Acc: 88.90%
Epoch 8/30 - Train Loss: 0.2891 - Val Acc: 89.45%
Epoch 9/30 - Train Loss: 0.2734 - Val Acc: 89.78%
Epoch 10/30 - Train Loss: 0.2612 - Val Acc: 89.80%`,
            },
          ],
          createdAtOffset: 86400000 * 3,
        },
        {
          script: imageClassificationScriptV2,
          params: {
            model: 'resnet50',
            batch_size: 64,
            learning_rate: 0.0001,
            epochs: 20,
            optimizer: 'adam',
            pretrained: true,
            freeze_backbone: true,
            image_size: 224,
            weight_decay: 0.0001,
            scheduler: 'step_lr',
            step_size: 5,
            gamma: 0.1,
            data_augmentation: {
              horizontal_flip: true,
              rotation: 10,
            },
          },
          description: '回滚到 v2 配置，v3 的增强导致训练不稳定',
          resultFiles: [
            {
              name: 'metrics.json',
              content: JSON.stringify({
                final_loss: 0.2789,
                accuracy: 0.858,
                best_accuracy: 0.863,
              }, null, 2),
            },
            {
              name: 'training_logs.txt',
              content: `Rollback from v4 to v2 configuration
Epoch 1/20 - Train Loss: 0.9123 - Val Acc: 72.89%
...`,
            },
          ],
          createdAtOffset: 86400000 * 1,
          isRollback: true,
          rollbackFrom: 1,
        },
      ]
    ),
    createMockExperiment(
      '数据清洗流水线',
      '电商用户行为数据清洗和特征工程，处理缺失值、异常值和生成时序特征',
      [
        {
          script: dataCleaningScriptV1,
          params: {
            drop_duplicates: true,
            drop_na: true,
            date_format: 'auto',
            feature_date: ['year', 'month'],
          },
          description: '基础清洗：去重、删除空值、日期解析',
          resultFiles: [
            {
              name: 'cleaning_report.json',
              content: JSON.stringify({
                original_rows: 100000,
                after_dedup: 98500,
                after_dropna: 89200,
                final_rows: 89200,
                columns: 25,
              }, null, 2),
            },
          ],
          createdAtOffset: 86400000 * 6,
        },
        {
          script: dataCleaningScriptV2,
          params: {
            drop_duplicates: true,
            duplicate_subset: ['id', 'date'],
            fillna_numeric: 'median',
            fillna_categorical: 'unknown',
            remove_outliers: true,
            outlier_method: 'zscore',
            outlier_threshold: 3,
            date_format: 'auto',
            feature_date: ['year', 'month', 'day_of_week', 'is_weekend'],
            normalize_columns: ['value'],
            normalize_method: 'minmax',
          },
          description: '增强清洗：智能填充、异常值检测、更多特征工程',
          resultFiles: [
            {
              name: 'cleaning_report.json',
              content: JSON.stringify({
                original_rows: 100000,
                after_dedup: 98200,
                after_fillna: 98200,
                after_outlier_removal: 95800,
                final_rows: 95800,
                columns: 30,
                outliers_removed: 2400,
              }, null, 2),
            },
            {
              name: 'feature_stats.csv',
              content: `feature,mean,std,min,max
value,156.23,89.45,10.20,987.60
value_normalized,0.158,0.092,0.0,1.0
year,2023.5,0.5,2023,2024`,
            },
          ],
          createdAtOffset: 86400000 * 4,
        },
      ]
    ),
    createMockExperiment(
      'NLP 情感分析',
      '基于 LSTM 的中文评论情感分析实验',
      [
        {
          script: sentimentAnalysisScriptV1,
          params: {
            model: 'lstm',
            vocab_size: 10000,
            embedding_dim: 64,
            max_length: 100,
            lstm_units: [64, 32],
            dropout_rate: 0.2,
            batch_size: 32,
            learning_rate: 0.001,
            epochs: 10,
            optimizer: 'adam',
            padding: 'post',
            truncating: 'post',
          },
          description: '初始 LSTM 模型，两层 LSTM 堆叠',
          resultFiles: [
            {
              name: 'metrics.json',
              content: JSON.stringify({
                accuracy: 0.823,
                loss: 0.412,
                precision: 0.815,
                recall: 0.834,
                f1_score: 0.824,
              }, null, 2),
            },
          ],
          createdAtOffset: 86400000 * 2,
        },
      ]
    ),
  ];
};

export const initializeMockDataIfEmpty = (): void => {
  const existing = localStorage.getItem('experiment-version-system');
  if (!existing) {
    const mockData = generateMockData();
    localStorage.setItem('experiment-version-system', JSON.stringify(mockData));
  }
};
