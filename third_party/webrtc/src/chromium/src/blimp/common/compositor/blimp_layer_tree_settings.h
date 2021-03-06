// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef BLIMP_COMMON_COMPOSITOR_BLIMP_LAYER_TREE_SETTINGS_H_
#define BLIMP_COMMON_COMPOSITOR_BLIMP_LAYER_TREE_SETTINGS_H_

#include "blimp/common/blimp_common_export.h"

namespace base {
class CommandLine;
}

namespace cc {
class LayerTreeSettings;
}

namespace gfx {
class Size;
}

namespace blimp {

// Populates shared server/client |settings| based on defaults & command line
// flags.  This might have to be tweaked into a message protocol if it turns out
// the host compositor needs to actually drive some specific settings of the
// client.
BLIMP_COMMON_EXPORT void PopulateCommonLayerTreeSettings(
    cc::LayerTreeSettings* settings);

}  // namespace blimp

#endif  // BLIMP_COMMON_COMPOSITOR_BLIMP_LAYER_TREE_SETTINGS_H_
