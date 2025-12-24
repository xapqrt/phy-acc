<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Field Operator</title>
    <style>
        body {
            margin: 0;
            background: #000;
            font-family: 'Courier New', monospace;
            color: #00ff00;
        }
        #canvas {
            display: block;
background: #000;
            border: 2px solid #00ff00;
            cursor: crosshair;
        }
        h1 {
            text-align: center;
            text-shadow: 0 0 10px #00ff00;
        }
    </style>
</head>
<body>
    <h1>⚡ Field Operator</h1>
    <canvas id="canvas" width="800" height="600"></canvas>
    
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // Test draw
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(100, 100, 50, 50);
        
        console.log('canvas ready');
    </script>
</body>
</html>
