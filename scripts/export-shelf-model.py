#!/usr/bin/env python3
"""Export the upstream display URDF and raised shelf for the browser viewer.

Usage: python3 scripts/export-shelf-model.py --source /path/to/Omx_Turtle_Bot
The upstream checkout is read-only; output is written beneath simulator/assets.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET


def vector(text, default):
    values = [float(x) for x in text.split()] if text else list(default)
    if len(values) != len(default):
        raise ValueError(f"Invalid vector: {text}")
    return values


def origin(node):
    o = node.find('origin')
    return {'xyz': vector(o.get('xyz') if o is not None else None, [0, 0, 0]),
            'rpy': vector(o.get('rpy') if o is not None else None, [0, 0, 0])}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path)
    args = parser.parse_args()
    source = args.source.resolve()
    repo = Path(__file__).resolve().parents[1]
    output = repo / 'simulator/assets'
    output.mkdir(parents=True, exist_ok=True)
    package = source / 'turtlebot3_manipulation/turtlebot3_manipulation_description'
    scripts = package / 'scripts'
    sys.path.insert(0, str(scripts))
    spec = importlib.util.spec_from_file_location('raised', scripts / 'export_raised_shelf_scene.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    root = ET.parse(package / 'urdf/leader_turtlebot3.urdf').getroot()
    module.add_raised_shelf(root, 'base_footprint', xy=(.300, 0), height=.100,
                            size=(.400, .400), stack_pitch=.156)
    files = {}

    def asset(uri):
        prefix = 'package://turtlebot3_manipulation_description/'
        if not uri.startswith(prefix):
            raise ValueError(f'Unsupported asset URI: {uri}')
        relative = Path(uri[len(prefix):])
        src = (package / relative).resolve()
        if not src.is_relative_to(package.resolve()) or not src.is_file():
            raise ValueError(f'Missing or invalid asset: {uri}')
        dst = output / relative
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
        key = relative.as_posix()
        files[key] = hashlib.sha256(src.read_bytes()).hexdigest()
        return key

    def material(node):
        if node is None:
            return {'rgba': [.55, .58, .64, 1]}
        color = node.find('color')
        result = {'rgba': vector(color.get('rgba') if color is not None else None,
                                 [.55, .58, .64, 1])}
        texture = node.find('texture')
        if texture is not None:
            result['texture'] = asset(texture.get('filename'))
        return result

    materials = {n.get('name'): material(n) for n in root.findall('material')}
    links = []
    for node in root.findall('link'):
        visuals = []
        for v in node.findall('visual'):
            geometry = v.find('geometry')
            shape = next(iter(geometry))
            kind = shape.tag
            if kind == 'mesh':
                geo = {'type': kind, 'file': asset(shape.get('filename')),
                       'scale': vector(shape.get('scale'), [1, 1, 1])}
            elif kind == 'box':
                geo = {'type': kind, 'size': vector(shape.get('size'), [1, 1, 1])}
            elif kind == 'cylinder':
                geo = {'type': kind, 'radius': float(shape.get('radius')),
                       'length': float(shape.get('length'))}
            elif kind == 'sphere':
                geo = {'type': kind, 'radius': float(shape.get('radius'))}
            else:
                raise ValueError(f'Unsupported geometry: {kind}')
            m = v.find('material')
            mat = materials.get(m.get('name')) if m is not None else None
            if m is not None and (m.find('color') is not None or m.find('texture') is not None):
                mat = material(m)
            visuals.append({**origin(v), 'geometry': geo,
                            'material': mat or {'rgba': [.55, .58, .64, 1]}})
        links.append({'name': node.get('name'), 'visuals': visuals})
    joints = []
    for j in root.findall('joint'):
        axis, limit, mimic = j.find('axis'), j.find('limit'), j.find('mimic')
        joint = {**origin(j), 'name': j.get('name'), 'type': j.get('type'),
                 'parent': j.find('parent').get('link'), 'child': j.find('child').get('link'),
                 'axis': vector(axis.get('xyz') if axis is not None else None, [1, 0, 0])}
        if limit is not None:
            joint['limit'] = {k: float(v) for k, v in limit.attrib.items()}
        if mimic is not None:
            joint['mimic'] = {'joint': mimic.get('joint'),
                              'multiplier': float(mimic.get('multiplier', 1)),
                              'offset': float(mimic.get('offset', 0))}
        joints.append(joint)
    names = {n['name'] for n in links}
    children = {j['child'] for j in joints}
    assert len(names) == len(links) and len(children) == len(joints)
    assert all(j['parent'] in names and j['child'] in names for j in joints)
    # Extract the actual four 6x6 marker patterns from the upstream print sheet.
    svg = ET.parse(source / 'omx_eef_vision/markers/01. ArUco ID 1-4 인쇄용.svg').getroot()
    markers = {}
    for index, (x0, y0) in enumerate([(30, 50), (130, 50), (30, 140), (130, 140)], 1):
        bits = [[0] * 6 for _ in range(6)]
        for rect in svg.iter('{http://www.w3.org/2000/svg}rect'):
            x, y = float(rect.get('x', 0)), float(rect.get('y', 0))
            if x0 - .01 <= x < x0 + 39.99 and y0 - .01 <= y < y0 + 39.99:
                bits[round((y-y0)/(40/6))][round((x-x0)/(40/6))] = 1
        markers[str(index)] = bits
    commit = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
    model = {'schemaVersion': 1, 'sourceRepository': 'KweonTJ/Omx_Turtle_Bot',
             'sourceCommit': commit, 'roots': sorted(names - children), 'links': links,
             'joints': joints, 'markers': markers, 'assets': files,
             'shelf': {'x': .3, 'supportHeight': .1, 'width': .365, 'depth': .285,
                       'binHeight': .18, 'stackPitch': .156, 'floorTop': .028},
             'initialJoints': {'joint1': .104311, 'joint2': .027612, 'joint3': -.001534,
                               'joint4': -1.638291, 'gripper_left_joint': .019}}
    (output / 'scene.json').write_text(json.dumps(model, separators=(',', ':')) + '\n')
    shutil.copyfile(source / 'turtlebot3_manipulation/LICENSE', output / 'UPSTREAM-LICENSE')
    print(f'Exported {len(links)} links, {len(joints)} joints, {len(files)} assets; source {commit}')


if __name__ == '__main__':
    main()
