import argparse
from pathlib import Path

import timm
import torch
import torch.nn as nn
import torch.nn.functional as F


class DoubleConv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)


class EfficientNetV2SUNet(nn.Module):
    ENC_CHANNELS = [24, 48, 64, 160, 256]

    def __init__(self, num_classes=2):
        super().__init__()
        self.encoder = timm.create_model(
            'tf_efficientnetv2_s',
            pretrained=False,
            features_only=True,
            in_chans=3,
        )
        C = self.ENC_CHANNELS
        self.dec1 = DoubleConv(C[4] + C[3], 256)
        self.dec2 = DoubleConv(256 + C[2], 128)
        self.dec3 = DoubleConv(128 + C[1], 64)
        self.dec4 = DoubleConv(64 + C[0], 32)
        self.dec5 = DoubleConv(32, 16)
        self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True)
        self.head = nn.Conv2d(16, num_classes, kernel_size=1)

    def forward(self, x):
        f0, f1, f2, f3, f4 = self.encoder(x)
        d = self.dec1(torch.cat([self.up(f4), f3], dim=1))
        d = self.dec2(torch.cat([self.up(d),  f2], dim=1))
        d = self.dec3(torch.cat([self.up(d),  f1], dim=1))
        d = self.dec4(torch.cat([self.up(d),  f0], dim=1))
        d = self.dec5(self.up(d))
        d = F.interpolate(d, size=x.shape[2:], mode='bilinear', align_corners=True)
        return self.head(d)


def load_state_dict(checkpoint_path: Path) -> dict:
    state = torch.load(checkpoint_path, map_location='cpu')
    if isinstance(state, dict):
        if 'model' in state:
            state = state['model']
        if all(key.startswith('module.') for key in state.keys()):
            state = {key[len('module.'):]: value for key, value in state.items()}
    return state


def verify_onnx(output_path: Path, image_size: int):
    """Quick CPU verification — if this passes, the browser WASM backend will too."""
    try:
        import onnxruntime as ort
        import numpy as np
        sess = ort.InferenceSession(str(output_path), providers=['CPUExecutionProvider'])
        dummy = np.random.randn(1, 3, image_size, image_size).astype(np.float32)
        out = sess.run(None, {sess.get_inputs()[0].name: dummy})
        print(f'  Verification passed — output shape: {out[0].shape}')
    except ImportError:
        print('  (onnxruntime not installed — skipping verification)')
    except Exception as e:
        print(f'  WARNING: verification failed: {e}')


def main():
    parser = argparse.ArgumentParser(
        description='Export the trained brain tumor segmentation model to ONNX.'
    )
    parser.add_argument('--weights', '-w', default='model/best_model.pth')
    parser.add_argument('--output',  '-o', default='public/model.onnx')
    parser.add_argument('--image-size', '-s', type=int, default=256)
    parser.add_argument(
        '--opset',
        type=int,
        default=12,   # ← was 17; onnxruntime-web WASM supports up to opset 13
        help='ONNX opset version (12 or 13 recommended for onnxruntime-web)',
    )
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent
    weights_path = Path(args.weights)
    output_path  = Path(args.output)

    if not weights_path.is_absolute():
        weights_path = project_root / weights_path
    if not output_path.is_absolute():
        output_path = project_root / output_path

    if not weights_path.exists():
        raise FileNotFoundError(f'Checkpoint not found: {weights_path}')

    output_path.parent.mkdir(parents=True, exist_ok=True)

    model = EfficientNetV2SUNet(num_classes=2)
    model.load_state_dict(load_state_dict(weights_path))
    model.eval()

    dummy_input = torch.randn(1, 3, args.image_size, args.image_size)

    print(f'Exporting {weights_path} → {output_path}  (opset {args.opset}) …')
    torch.onnx.export(
        model,
        dummy_input,
        str(output_path),
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input':  {0: 'batch'},
            'output': {0: 'batch'},
        },
        opset_version=args.opset,
        do_constant_folding=True,
    )
    print(f'✅ ONNX export complete: {output_path}')

    print('Verifying with onnxruntime …')
    verify_onnx(output_path, args.image_size)


if __name__ == '__main__':
    main()