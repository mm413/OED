/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

<<<<<<< HEAD
SELECT id, name, ipaddress, displayable, enabled, meter_type FROM meters
    WHERE id=${id};
=======
SELECT id, name, ipaddress, identifier, enabled, meter_type FROM meters WHERE id=${id};
>>>>>>> noraObv/obvius
